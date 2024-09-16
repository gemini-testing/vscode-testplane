import vscode from "vscode";
import { fork, type ChildProcess } from "node:child_process";
import { resolve, normalize } from "pathe";
import { logger, findNodePath } from "../utils";
import ipc from "../ipc";
import { CONFIG_GLOB, CONFIG_GLOB_EXCLUDE } from "../constants";
import { WorkerEvents, type WorkerInitFailEventMessage } from "../worker/types";
import { MasterEvents } from "../types";

export * from "./rpc";

export async function createChildProcess(wf: vscode.WorkspaceFolder): Promise<ChildProcess> {
    const workerPath = resolve(__dirname, "worker.js");
    const configPaths = await vscode.workspace.findFiles(CONFIG_GLOB, CONFIG_GLOB_EXCLUDE);
    const execPath = await findNodePath();

    const proc = fork(workerPath, { cwd: normalize(wf.uri.fsPath), stdio: "overlapped", execPath });

    proc.stdout?.on("data", d => logger.worker("info", d.toString()));
    proc.stderr?.on("data", d => logger.worker("error", d.toString()));

    return await new Promise<ChildProcess>((resolve, reject) => {
        function onInitSuccess(): void {
            resolve(proc);
            unsubscribe();
        }

        function onInitFail(message: WorkerInitFailEventMessage): void {
            const error = new Error(`Testplane failed to start: \n${message.error}`);
            reject(error);
            unsubscribe();
        }

        function onError(err: Error): void {
            logger.error(err);

            reject(err);
            unsubscribe();
        }

        function onExit(code: number): void {
            reject(new Error(`Testplane process exited with code ${code}`));
        }

        function unsubscribe(): void {
            proc.off("message", onInitSuccess);
            proc.off("message", onInitFail);
            proc.off("error", onError);
            proc.off("exit", onExit);
        }

        ipc.on(WorkerEvents.INIT_SUCCESS, onInitSuccess, proc);
        ipc.on(WorkerEvents.INIT_FAIL, onInitFail, proc);
        proc.on("error", onError);
        proc.on("exit", onExit);

        proc.once("spawn", () => {
            ipc.emit(
                MasterEvents.INIT,
                {
                    cwd: normalize(wf.uri.fsPath),
                    configPath: configPaths[0].fsPath,
                },
                proc,
            );
        });
    });
}
