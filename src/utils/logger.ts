import { window } from "vscode";
import format from "strftime";

const vscodeLogger = window.createOutputChannel("Testplane");

export const logger = {
    worker: (type: "info" | "error", ...args: unknown[]) => {
        const prefix = getPrefixWithTimestamp("WORKER");

        console[type](prefix, ...args);
        vscodeLogger.appendLine(`${prefix} ${args.join(" ")}`);
    },
    info: (...args: unknown[]): void => {
        const prefix = getPrefixWithTimestamp("INFO");

        console.info(prefix, ...args);
        vscodeLogger.appendLine(`${prefix} ${args.join(" ")}`);
    },
    error: (...args: unknown[]): void => {
        const prefix = getPrefixWithTimestamp("ERROR");

        console.error(prefix, ...args);
        vscodeLogger.appendLine(`${prefix} ${args.join(" ")}`);
    },
    debug:
        process.env.TESTPLANE_VSCODE_DEBUG !== "true"
            ? undefined
            : (...args: unknown[]): void => {
                  const prefix = getPrefixWithTimestamp("DEBUG");

                  console.log(prefix, ...args);
                  vscodeLogger.appendLine(`${prefix} ${args.join(" ")}`);
              },
    openOutput() {
        vscodeLogger.show();
    },
} as const;

function getPrefixWithTimestamp(loggerType: string): string {
    const timestamp = format("%H:%M:%S");

    return `[${loggerType} ${timestamp}]`;
}
