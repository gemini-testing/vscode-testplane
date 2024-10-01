import path from "node:path";
import * as vscode from "vscode";
import _ from "lodash";
import { CONFIG_GLOB, CONFIG_GLOB_EXCLUDE } from "../constants";

export const findTestplaneConfigFile = async (): Promise<string | undefined> => {
    const configs = await vscode.workspace.findFiles(CONFIG_GLOB, CONFIG_GLOB_EXCLUDE);
    const consfigsSortedByNesting = configs.sort((a, b) => {
        return a.fsPath.split(path.sep).length - b.fsPath.split(path.sep).length;
    });

    if (_.isEmpty(consfigsSortedByNesting)) {
        return;
    }

    return configs[0].fsPath;
};
