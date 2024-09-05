import _ from "lodash";
import type { ChildProcess } from "node:child_process";
import { MasterEvents, type MasterInitEventMessage } from "./types";
import { WorkerEvents, type WorkerInitFailEventMessage } from "./worker/types";

function emit(event: MasterEvents.INIT, data: MasterInitEventMessage, proc: ChildProcess | NodeJS.Process): void;
function emit(event: WorkerEvents.INIT_SUCCESS): void;
function emit(event: WorkerEvents.INIT_FAIL, data: WorkerInitFailEventMessage): void;
function emit(event: string, data: Record<string, unknown> = {}, proc: ChildProcess | NodeJS.Process = process): void {
    proc.send && proc.send({ event, ...data });
}

export default {
    emit,
    on: <T extends Record<string, unknown>>(
        event: string,
        handler: (msg: T & { event: string }) => void,
        proc: ChildProcess | NodeJS.Process = process,
    ): void => {
        proc.on("message", (msg: T & { event: string }) => {
            if (event !== _.get(msg, "event")) {
                return;
            }

            handler(msg);
        });
    },
};
