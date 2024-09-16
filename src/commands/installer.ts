import * as vscode from "vscode";

export const installTestplane = async (): Promise<void> => {
    const [workspaceFolder] = vscode.workspace.workspaceFolders || [];
    if (!workspaceFolder) {
        await vscode.window.showErrorMessage("Open a folder in VS Code to initialize Testplane");
        return;
    }

    const terminal = vscode.window.createTerminal({
        name: "Install Testplane",
        cwd: workspaceFolder.uri.fsPath,
        env: process.env,
    });

    terminal.show();

    terminal.sendText(`npm init testplane@latest`, true);
};
