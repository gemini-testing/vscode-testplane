import * as vscode from "vscode";
import { installTestplane } from "./installer";

export const registerCommands = (): vscode.Disposable[] => {
    return [vscode.commands.registerCommand("tpn.install", installTestplane)];
};
