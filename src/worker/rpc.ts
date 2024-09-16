import { createBirpc, type ChannelOptions } from "birpc";
import type { TestplaneWorkerRPC, TestplaneMasterEvents, TestplaneWorkerMethods } from "../types";

export function createTestplaneWorkerRPC(
    testplane: TestplaneWorkerMethods,
    channel: ChannelOptions,
): TestplaneWorkerRPC {
    return createBirpc<TestplaneMasterEvents, TestplaneWorkerMethods>(testplane, {
        timeout: -1,
        eventNames: ["onTestBegin", "onTestPass", "onTestFail", "onTestPending", "onRunnerEnd"],
        resolver: (name, fn) => {
            if (name === "toJSON") {
                return (...args: unknown[]) => JSON.stringify(...(args as Parameters<typeof JSON.stringify>));
            }

            return fn;
        },
        ...channel,
    });
}
