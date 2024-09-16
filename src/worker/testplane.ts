import _ from "lodash";
import type Testplane from "testplane";
import type { FormatterTreeMainRunnable } from "testplane";
import type {
    TestplaneWorkerMethods,
    TestplaneWorkerReadTestsOpts,
    TestplaneWorkerRunTestsOpts,
    TestplaneMasterReadTestsOpts,
    TestplaneMasterRunTestsOpts,
} from "../types";

export const getTestplaneAPI = (testplane: Testplane): TestplaneWorkerMethods => ({
    readTests: async (testPaths, masterOpts = {}): Promise<FormatterTreeMainRunnable[]> => {
        const workerOpts = prepareOptions(masterOpts);
        const testCollection = await testplane.readTests(testPaths, workerOpts);

        if (!testCollection.format || !testCollection.formatters?.TREE) {
            throw new Error("Interaction with tests is supported only from testplane@8.20.0 and higher");
        }

        return testCollection.format(testCollection.formatters.TREE) as FormatterTreeMainRunnable[];
    },

    runTests: async (testPaths, masterOpts = {}): Promise<boolean> => {
        const workerOpts = prepareOptions(masterOpts);
        const isSuccess = await testplane.run(testPaths, workerOpts);

        return isSuccess;
    },

    stopTests: (message: string = "Tests were stopped by the user"): void => {
        testplane.halt(new Error(message), 0);
    },
});

function prepareOptions(masterOpts: TestplaneMasterReadTestsOpts): TestplaneWorkerReadTestsOpts;
function prepareOptions(masterOpts: TestplaneMasterRunTestsOpts): TestplaneWorkerRunTestsOpts;
function prepareOptions(
    masterOpts: TestplaneMasterReadTestsOpts | TestplaneMasterRunTestsOpts,
): TestplaneWorkerReadTestsOpts | TestplaneWorkerRunTestsOpts {
    const workerOpts: TestplaneWorkerReadTestsOpts | TestplaneWorkerRunTestsOpts = _.omit(masterOpts, "grep") || {};

    if (masterOpts.grep) {
        workerOpts.grep = new RegExp(masterOpts.grep);
    }

    return workerOpts;
}
