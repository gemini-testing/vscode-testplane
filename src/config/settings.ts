import path from "node:path";
import os from "node:os";
import * as vscode from "vscode";

export type VSCodeSettings = {
    configPath: string | undefined;
};

export const getVSCodeSettings = (wf?: vscode.WorkspaceFolder): VSCodeSettings => {
    const rootConfig = vscode.workspace.getConfiguration("testplane");
    const folderConfig = vscode.workspace.getConfiguration("testplane", wf);

    const get = <T>(key: string, defaultValue?: T): T | undefined =>
        getSettingValue<T>({
            rootConfig,
            folderConfig,
            key,
            defaultValue,
        });

    const configPath = get<string>("configPath");

    return {
        configPath: resolveConfigPath(configPath, wf),
    };
};

type SettingValueOptions<T> = {
    rootConfig: vscode.WorkspaceConfiguration;
    folderConfig: vscode.WorkspaceConfiguration;
    key: string;
    defaultValue?: T;
};

function getSettingValue<T>({ rootConfig, folderConfig, key, defaultValue }: SettingValueOptions<T>): T | undefined {
    return folderConfig.get(key) ?? rootConfig.get(key) ?? defaultValue;
}

function resolveConfigPath(configPath: string | undefined, wf?: vscode.WorkspaceFolder): string | undefined {
    if (!configPath || path.isAbsolute(configPath)) {
        return configPath;
    }

    if (configPath.startsWith("~/")) {
        return path.resolve(os.homedir(), configPath.slice(2));
    }

    if (wf) {
        return path.resolve(wf.uri.fsPath, configPath);
    }

    return configPath;
}
