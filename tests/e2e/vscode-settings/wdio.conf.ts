import path from "node:path";
import { getWdioConfig } from "../utils";
import type { Options } from "@wdio/types";

export const config: Options.Testrunner = getWdioConfig({
    extensionPath: process.cwd(),
    workspacePath: path.resolve(process.cwd(), "samples/vscode-settings"),
});
