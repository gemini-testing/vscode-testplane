import * as vscode from "vscode";
import _ from "lodash";

import { TestTree } from "./test-tree";
import { logger, showTestplaneError } from "./utils";
import { version, displayName } from "../package.json";
import { TestRunner } from "./api/runner";
import { createChildProcess, createTestplaneMasterRpc } from "./api";
import { registerCommands } from "./commands";
import { registerViews } from "./views";
import { CONFIG_GLOB } from "./constants";
import { getVSCodeConfig } from "./config";

const CONFIG_DEBOUNCE_WAIT = 300;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // eslint-disable-next-line no-use-before-define
    const extension = new TestplaneExtension(context);
    context.subscriptions.push(extension);
    await extension.activate();
}

class TestplaneExtension {
    private _context: vscode.ExtensionContext;
    private _testController: vscode.TestController;
    private _loadingTestItem: vscode.TestItem;
    private _testTree: TestTree;
    private _testRunProfiles = new Map<string, vscode.TestRunProfile>();
    private _disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        logger.info(
            `[v${version}] Testplane extension is activated because Testplane is installed or there is a config file in the workspace`,
        );

        this._context = context;
        this._testController = vscode.tests.createTestController(displayName.toLowerCase(), displayName);
        this._testController.refreshHandler = async (): Promise<void> => {
            try {
                await this._defineTestRunProfiles();
            } catch (err) {
                logger.error("Failed to refresh Testplane", err);
            }
        };

        this._loadingTestItem = this._testController.createTestItem("_reading", "Reading Testplane Tests...");
        this._testTree = TestTree.create(this._testController, this._loadingTestItem);
    }

    async activate(): Promise<void> {
        const configWatcher = this._createConfigWatcher();
        this._disposables = [...registerViews(this._context), ...registerCommands(), configWatcher];

        await this._defineTestRunProfiles();
    }

    async dispose(): Promise<void> {
        this._testController.dispose();
        this._testTree.dispose();
        this._testRunProfiles.forEach(profile => profile.dispose());
        this._testRunProfiles.clear();
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }

    private _createConfigWatcher(): vscode.FileSystemWatcher {
        const configWatcher = vscode.workspace.createFileSystemWatcher(CONFIG_GLOB);

        const redefineTestProfiles = _.debounce(async (uri: vscode.Uri) => {
            if (uri.fsPath.includes("node_modules")) {
                return;
            }

            await this._defineTestRunProfiles();
        }, CONFIG_DEBOUNCE_WAIT);

        configWatcher.onDidChange(redefineTestProfiles);
        configWatcher.onDidCreate(redefineTestProfiles);
        configWatcher.onDidDelete(redefineTestProfiles);

        return configWatcher;
    }

    private async _defineTestRunProfiles(): Promise<void> {
        try {
            const folders = vscode.workspace.workspaceFolders || [];
            this._testTree.reset(folders);

            // TODO: should support few workspaces
            const wf = folders[0];
            const config = await getVSCodeConfig(wf);
            const childProc = await createChildProcess(wf, config);

            const { api, handlers } = createTestplaneMasterRpc({
                on: listener => {
                    childProc.on("message", listener);
                },
                post: (message: string) => childProc.send(message),
            });

            const tests = await api.readTests([], { runnableOpts: { saveLocations: true } });
            await this._testTree.registerWorkspaceTests(wf, tests);

            this._testController.items.delete(this._loadingTestItem.id);

            const runner = new TestRunner({
                controller: this._testController,
                context: this._context,
                tree: this._testTree,
                workspaceFolder: wf,
                api,
                handlers,
            });

            const previousRunProfiles = this._testRunProfiles;
            this._testRunProfiles = new Map();

            let runProfile = previousRunProfiles.get("run");

            if (!runProfile) {
                runProfile = this._testController.createRunProfile("Run", vscode.TestRunProfileKind.Run, () => {
                    logger.error("Run handler is not defined");
                });
            }

            runProfile.runHandler = async (request, token): Promise<void> => {
                try {
                    await runner.runTests(request, token);
                } catch (err) {
                    showTestplaneError("There was an error during run Testplane tests", err as Error);
                }
            };

            // TODO: should register for each workspace
            this._testRunProfiles.set("run", runProfile);
        } catch (err) {
            showTestplaneError("There was an error during Testplane startup", err as Error);
        }
    }
}
