import * as vscode from "vscode";
import _ from "lodash";
import { basename, normalize, relative } from "pathe";
import stripAnsi from "strip-ansi";
import ErrorStackParser from "error-stack-parser";
import type { TestError } from "testplane";

import { TestTree } from "../test-tree";
import { getUniqBrowserId } from "../test-tree/data";
import { TestCaseByBrowser, getTestData } from "../test-tree/data";
import { logger } from "../utils";
import type {
    TestplaneMasterRPC,
    TestplaneMasterHandlers,
    TestplaneMasterTest,
    TestplaneMasterTestResult,
    TestplaneMasterRunTestsOpts,
} from "../types";

interface LocationFromStack {
    path: string;
    line: number;
    column: number;
}

enum TestStatuses {
    BEGIN = "begin",
    PASS = "pass",
    FAIL = "fail",
    PENDING = "pending",
    ENQUEUED = "enqueued",
}

export class TestRunner extends vscode.Disposable {
    private _testRun: vscode.TestRun | undefined;

    constructor(
        private readonly _controller: vscode.TestController,
        private readonly _tree: TestTree,
        private readonly _workspaceFolder: vscode.WorkspaceFolder,
        private readonly _api: TestplaneMasterRPC,
        private readonly _handlers: TestplaneMasterHandlers,
    ) {
        super(() => {
            logger.debug?.("Dispose test runner");

            this._handlers.clearListeners();
            this._endTestRun();
        });

        this._handleTestRunResults();
    }

    async runTests(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
        this._testRun = this._controller.createTestRun(request);

        token.onCancellationRequested(() => {
            const testNames = request.include ? request.include.map(p => p.label).join(", ") : "all tests";
            logger.debug?.(`Test run was cancelled manually for ${testNames}`);

            this._endTestRun();
        });

        const tests = request.include || [];
        const root = this._workspaceFolder.uri.fsPath;

        if (!tests.length) {
            const browserItems = this._tree.getBrowserTestItemsByFolderPath(root);
            browserItems.forEach(browserItem => this._enqueueTestItem(browserItem));

            logger.info(`Running all tests in ${basename(root)} folder`);
            await this._api.runTests([]);

            return;
        }

        tests.forEach(testItem => this._enqueueTestItem(testItem));
        const files = getTestFiles(tests);
        const opts = getRunTestsOpts(tests);

        if (!_.isEmpty(opts)) {
            logger.info(`Running ${files.length} file(s) with options: ${JSON.stringify(opts)}`);
        } else {
            logger.info(
                `Running ${files.length} file(s):`,
                files.map(f => relative(root, f)),
            );
        }

        await this._api.runTests(files, opts);
    }

    private _handleTestRunResults(): void {
        this._handlers.onTestBegin((test: TestplaneMasterTest): void => {
            this._markTest(test, TestStatuses.BEGIN);
        });

        this._handlers.onTestPass((test: TestplaneMasterTestResult): void => {
            this._markTest(test, TestStatuses.PASS);
        });

        this._handlers.onTestFail((test: TestplaneMasterTestResult): void => {
            this._markTest(test, TestStatuses.FAIL);
        });

        this._handlers.onTestPending((test: TestplaneMasterTest): void => {
            this._markTest(test, TestStatuses.PENDING);
        });

        this._handlers.onRunnerEnd(() => {
            this._testRun?.end();
            this._testRun = undefined;
        });
    }

    private _markTest(test: TestplaneMasterTest | TestplaneMasterTestResult, testStatus: TestStatuses): void {
        const uniqBrowserId = getUniqBrowserId(test.id, test.browserId);
        const testItem = this._tree.getBrowserTestItemById(uniqBrowserId);
        const testInfo = `test with title: "${test.fullTitle}" and browserId: "${test.browserId}"`;

        if (!testItem) {
            logger.error(`Cannot find ${testInfo}`);
            return;
        }

        this._markTestItem({ testItem, testStatus, testInfo, test });
    }

    private _markTestItem({
        testItem,
        testStatus,
        testInfo,
        test,
    }: {
        testItem: vscode.TestItem;
        testStatus: TestStatuses;
        testInfo: string;
        test?: TestplaneMasterTest | TestplaneMasterTestResult;
    }): void {
        if (!testItem) {
            logger.error(`Cannot find ${testInfo}`);
            return;
        }

        if (!this._testRun) {
            logger.error(`There is no test run for ${testInfo}`);
            return;
        }

        switch (testStatus) {
            case TestStatuses.BEGIN: {
                logger.debug?.(`Mark ${testInfo} as running`);
                this._testRun.started(testItem);

                break;
            }

            case TestStatuses.PASS: {
                logger.debug?.(`Mark ${testInfo} as passed`);
                this._testRun.passed(testItem, (test as TestplaneMasterTestResult).duration);

                break;
            }

            case TestStatuses.FAIL: {
                logger.debug?.(`Mark ${testInfo} as failed`);
                const testResult = test as TestplaneMasterTestResult;
                const errMessage = testMessageForTestFail(testItem, testResult.err);
                this._testRun.failed(testItem, errMessage, testResult.duration);

                break;
            }

            case TestStatuses.PENDING: {
                logger.debug?.(`Mark ${testInfo} as skipped`);
                this._testRun.skipped(testItem);

                break;
            }

            case TestStatuses.ENQUEUED: {
                logger.debug?.(`Mark ${testInfo} as enqueued`);
                this._testRun.enqueued(testItem);

                testItem.children.forEach(child => this._enqueueTestItem(child));

                break;
            }
        }
    }

    private _enqueueTestItem(testItem: vscode.TestItem): void {
        const testInfo = `test with title: "${testItem.label}"`;
        this._markTestItem({ testItem, testStatus: TestStatuses.ENQUEUED, testInfo });
    }

    private _endTestRun(): void {
        logger.debug?.("Ending test run", this._testRun?.name || "<none>");
        this._testRun?.end();
        this._testRun = undefined;
        this._api.stopTests();
    }
}

function getTestFiles(tests: readonly vscode.TestItem[]): string[] {
    return _.uniq(tests.map(test => normalize(test.uri!.fsPath)).filter(Boolean));
}

function getRunTestsOpts(tests: readonly vscode.TestItem[]): Partial<TestplaneMasterRunTestsOpts> {
    const opts: TestplaneMasterRunTestsOpts = {};
    const patterns: string[] = [];
    const browserIds = new Set<string>();

    for (const test of tests) {
        const data = getTestData(test)!;

        if ("getTestNamePattern" in data) {
            patterns.push(data.getTestNamePattern());
        }

        if ("getBrowserId" in data) {
            browserIds.add((data as TestCaseByBrowser).getBrowserId());
        }
    }

    if (patterns.length) {
        opts.grep = patterns.join("|");
    }

    if (browserIds.size) {
        opts.browsers = [...browserIds];
    }

    return opts;
}

function testMessageForTestFail(testItem: vscode.TestItem, error?: TestError): vscode.TestMessage {
    if (!error) {
        return new vscode.TestMessage("Unknown error");
    }

    const testMessage = new vscode.TestMessage(stripAnsi(error.message));
    const location = parseLocationFromStack(testItem, error);

    if (location) {
        const position = new vscode.Position(location.line - 1, location.column - 1);
        testMessage.location = new vscode.Location(vscode.Uri.file(location.path), position);
    }

    return testMessage;
}

function parseLocationFromStack(testItem: vscode.TestItem, error: Error): LocationFromStack | undefined {
    const targetFilepath = testItem.uri!.fsPath;
    const parsedStackFrames = ErrorStackParser.parse(error);

    for (const stackFrame of parsedStackFrames) {
        const { fileName, lineNumber, columnNumber } = stackFrame;

        if (targetFilepath !== fileName || Number.isNaN(lineNumber) || Number.isNaN(columnNumber)) {
            continue;
        }

        return {
            path: targetFilepath,
            line: lineNumber!,
            column: columnNumber!,
        };
    }

    logger.debug?.("Could not find a valid stack for", testItem.label, error);
}
