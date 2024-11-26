import * as vscode from "vscode";
import { getVSCodeSettings, type VSCodeSettings } from "./settings";
import { findTestplaneConfigFile } from "./utils";

export type VSCodeConfig = VSCodeSettings;

export const getVSCodeConfig = async (wf?: vscode.WorkspaceFolder): Promise<VSCodeConfig> => {
    const settings = getVSCodeSettings(wf);
    const configPath = settings.configPath ? settings.configPath : await findTestplaneConfigFile();

    return {
        configPath,
        env: settings.env,
    };
};
