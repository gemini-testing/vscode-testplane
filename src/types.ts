import type Testplane from "testplane";
import type { FormatterTreeMainRunnable, Test, TestResult, StatsResult } from "testplane";
import { type BirpcReturn } from "birpc";

type MasterTestOpts = {
    fullTitle: string;
};

export type TestplaneMasterTest = Omit<Test, "fullTitle"> & MasterTestOpts;
export type TestplaneMasterTestResult = Omit<TestResult, "fullTitle"> & MasterTestOpts;

export interface TestplaneMasterEvents {
    onTestBegin: (test: TestplaneMasterTest) => void;
    onTestPass: (test: TestplaneMasterTestResult) => void;
    onTestFail: (test: TestplaneMasterTestResult) => void;
    onTestPending: (test: TestplaneMasterTest) => void;
    onRunnerEnd: (stats: StatsResult) => void;
}

type MasterMethodOpts = {
    grep?: string;
};

export type TestplaneWorkerReadTestsOpts = Required<Parameters<Testplane["readTests"]>>[1];
export type TestplaneMasterReadTestsOpts = Omit<TestplaneWorkerReadTestsOpts, "grep"> & MasterMethodOpts;

export type TestplaneWorkerRunTestsOpts = Required<Parameters<Testplane["run"]>>[1];
export type TestplaneMasterRunTestsOpts = Omit<TestplaneWorkerRunTestsOpts, "grep"> & MasterMethodOpts;

export interface TestplaneWorkerMethods {
    readTests(testPaths: string[], opts?: TestplaneMasterReadTestsOpts): Promise<FormatterTreeMainRunnable[]>;
    runTests(testPaths: string[], opts?: TestplaneMasterRunTestsOpts): Promise<boolean>;
    stopTests(message?: string): void;
}

export type TestplaneMasterRPC = BirpcReturn<TestplaneWorkerMethods, TestplaneMasterEvents>;
export type TestplaneWorkerRPC = BirpcReturn<TestplaneMasterEvents, TestplaneWorkerMethods>;

export type TestplaneMasterHandlers = Record<
    keyof TestplaneMasterEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (listener: (...args: any[]) => void) => void
> & { clearListeners: () => void };

export enum MasterEvents {
    INIT = "initialize",
}

export type MasterInitEventMessage = {
    cwd: string;
    configPath: string;
};
