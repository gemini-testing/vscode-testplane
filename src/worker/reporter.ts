import type Testplane from "testplane";
import type { Test, TestResult, StatsResult } from "testplane";
import type { TestplaneWorkerRPC, TestplaneMasterTest, TestplaneMasterTestResult } from "../types";

export class TestplaneReporter {
    private _rpc!: TestplaneWorkerRPC;

    constructor(private readonly _testplane: Testplane) {
        this._testplane.on(this._testplane.events.TEST_BEGIN, test => this._onTestBegin(test));
        this._testplane.on(this._testplane.events.TEST_PASS, test => this._onTestPass(test));
        this._testplane.on(this._testplane.events.TEST_FAIL, test => this._onTestFail(test));
        this._testplane.on(this._testplane.events.TEST_PENDING, test => this._onTestPending(test));
        this._testplane.on(this._testplane.events.RUNNER_END, stats => this._onRunnerEnd(stats));
    }

    initRpc(rpc: TestplaneWorkerRPC): void {
        this._rpc = rpc;
    }

    private _onTestBegin(test: Test): void {
        this._rpc.onTestBegin(convertTest(test));
    }

    private _onTestPass(test: TestResult): void {
        this._rpc.onTestPass(convertTest(test));
    }

    private _onTestFail(test: TestResult): void {
        this._rpc.onTestFail(convertTest(test));
    }

    private _onTestPending(test: Test): void {
        this._rpc.onTestPending(convertTest(test));
    }

    private _onRunnerEnd(stats: StatsResult): void {
        this._rpc.onRunnerEnd(stats);
    }
}

function convertTest<T extends TestplaneMasterTest | TestplaneMasterTestResult>(test: Test): T {
    const err = test.err ? { ...test.err, message: test.err?.message, stack: test.err?.stack } : undefined;

    return {
        ...test,
        id: test.id,
        file: test.file,
        fullTitle: test.fullTitle(),
        browserId: test.browserId,
        pending: test.pending,
        skipReason: test.skipReason,
        err,
    } as T;
}
