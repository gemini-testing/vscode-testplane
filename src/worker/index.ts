import util from "node:util";
import ipc from "../ipc";
import { createTestplaneWorkerRPC } from "./rpc";
import { getTestplaneAPI } from "./testplane";
import { TestplaneReporter } from "./reporter";
import { MasterEvents, type MasterInitEventMessage } from "../types";
import { WorkerEvents } from "./types";

import type Testplane from "testplane";

type MessageWithError = {
    e: Error;
};

ipc.on<MasterInitEventMessage>(MasterEvents.INIT, message => {
    try {
        const { cwd, configPath } = message;
        const defaultPathsToResolve = require.resolve.paths("testplane") || [];
        const testplaneNodePath = require.resolve("testplane", { paths: [cwd, ...defaultPathsToResolve] });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Testplane = (require(testplaneNodePath) as typeof import("testplane")).default;
        const testplane = new Testplane(configPath);
        disableBrowserRetries(testplane);

        const reporter = new TestplaneReporter(testplane);

        const rpc = createTestplaneWorkerRPC(getTestplaneAPI(testplane), {
            on(listener: (args: unknown[]) => void) {
                process.on("message", listener);
            },
            post(message: unknown) {
                if (isObjectMessageWithError(message)) {
                    process.send!({ ...message, e: message.e.stack });
                    return;
                }

                process.send!(message);
            },
        });
        reporter.initRpc(rpc);

        ipc.emit(WorkerEvents.INIT_SUCCESS);
    } catch (err) {
        ipc.emit(WorkerEvents.INIT_FAIL, { error: util.inspect(err as Error) });
    }
});

function disableBrowserRetries(testplane: Testplane): void {
    for (const browserId of testplane.config.getBrowserIds()) {
        const browserConfig = testplane.config.forBrowser(browserId);
        browserConfig.retry = 0;
    }
}

function isObjectMessageWithError(msg: unknown): msg is MessageWithError {
    return typeof msg === "object" && msg !== null && "e" in msg && msg.e instanceof Error;
}
