import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand("hrm.install", async () => {
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

        terminal.sendText(`npm init testplane@latest -- --yes`, true);
    });

    context.subscriptions.push(disposable);
}
