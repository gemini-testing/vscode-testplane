import fs from "node:fs/promises";
import path from "node:path";
import type { Options } from "@wdio/types";

const extensionPath = process.env.VSCODE_E2E_EXTENSION_PATH ?? process.cwd();
const workspacePath = path.resolve(process.cwd(), process.env.VSCODE_E2E_WORKSPACE_PATH || "samples/settings-view");

export const config: Options.Testrunner = {
    runner: "local",
    specs: ["./specs/**/*.ts"],
    maxInstances: 1,
    capabilities: [
        {
            browserName: "vscode",
            browserVersion: process.env.VSCODE_VERSION || "stable",
            "wdio:vscodeOptions": {
                extensionPath,
                workspacePath,
                userSettings: {
                    "npm.packageManager": "npm",
                    "git.openRepositoryInParentFolders": "never",
                },
            },
        },
    ],
    logLevel: "info",
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 0,
    specFileRetries: process.env.RUN_IN_CI ? 1 : 0,
    services: ["vscode"],
    framework: "mocha",
    reporters: ["spec"],
    mochaOpts: {
        ui: "bdd",
        timeout: 60000,
    },
    afterTest: async (test, _, { passed }) => {
        if (passed) {
            return;
        }

        const screenshotDir = path.join(__dirname, "..", "screens-on-fail");
        await fs.mkdir(screenshotDir, { recursive: true });
        await browser.saveScreenshot(path.join(screenshotDir, `${test.parent} - ${test.title}.png`));
    },
};
