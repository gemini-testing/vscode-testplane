import * as vscode from "vscode";

const DEFAULT_SETTINGS = {
    devtools: false,
    repl: false,
};

export type SettingOptions = typeof DEFAULT_SETTINGS;

export class SettingsViewProvider implements vscode.WebviewViewProvider {
    private _view: vscode.WebviewView | undefined;

    public static readonly viewType = "tpn.settingsView";

    constructor(private readonly _context: vscode.ExtensionContext) {}

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;

        this._view.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri],
        };

        this._view.webview.html = this._getHtmlForWebview(this._view.webview);

        this._view.webview.onDidReceiveMessage(data => {
            switch (data.method) {
                case "toggleSettingsCheckbox": {
                    const { settingName, value } = data.params;

                    const prevSettings = this._getWorkspaceSettings();
                    const newSettings = {
                        ...prevSettings,
                        [settingName]: value,
                    };

                    this._context.workspaceState.update("tpn.settings", newSettings);

                    break;
                }
            }
        });

        this._view.onDidChangeVisibility(() => {
            if (!webviewView.visible) {
                return;
            }

            this._updateSettings(this._getWorkspaceSettings());
        });

        const initialSettings = this._getWorkspaceSettings();
        this._updateSettings(initialSettings);
    }

    private _getWorkspaceSettings(): SettingOptions {
        return this._context.workspaceState.get<SettingOptions>("tpn.settings") || DEFAULT_SETTINGS;
    }

    private _updateSettings(settings: SettingOptions): void {
        this._view!.webview.postMessage({ method: "updateSettings", params: { settings } });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, "media", "settings-view", "main.css"),
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, "media", "settings-view", "main.js"),
        );

        return `
            <!DOCTYPE html>
			<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleUri}" rel="stylesheet">
                    <title>Testplane</title>
                </head>
                <body>
                    <div class="section section_type_settings">
                        <div class="section__header">Settings</div>
                        <div class="section__list">
                            <div class="section__list-item">
                                <label title="When enabled, Testplane will run tests in devtools mode">
                                    <input type="checkbox" settingName="devtools"></input>
                                    Enable devtools
                                </label>
                            </div>
                            <div class="section__list-item">
                                <label title="When enabled, Testplane will run tests in REPL mode">
                                    <input type="checkbox" settingName="repl"></input>
                                    Enable REPL
                                </label>
                            </div>
                        </div>
                    </div>

                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
			</html>
        `;
    }
}

function getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
