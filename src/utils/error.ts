import * as vscode from "vscode";
import { logger } from "./logger";

export const showTestplaneError = (message: string, error?: Error): void => {
    if (error) {
        logger.error(error);
    }

    vscode.window.showErrorMessage(`${message}. Check the output for more details.`, "See error").then(() => {
        logger.openOutput();
    });
};
