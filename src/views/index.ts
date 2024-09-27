import * as vscode from "vscode";
import { SettingsViewProvider } from "./settings";

export const registerViews = (context: vscode.ExtensionContext): vscode.Disposable[] => {
    return [vscode.window.registerWebviewViewProvider("tpn.settingsView", new SettingsViewProvider(context))];
};
