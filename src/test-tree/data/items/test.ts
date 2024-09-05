import { BaseTestData } from "./base";
import { setTestData } from "../storage";
import { getTestNamePattern } from "../utils";
import type * as vscode from "vscode";

export class TestCase extends BaseTestData {
    static register(item: vscode.TestItem, parent: vscode.TestItem): TestCase {
        return setTestData(item, new TestCase(item, parent));
    }

    private constructor(item: vscode.TestItem, parent: vscode.TestItem) {
        super(item, parent);
    }

    getTestNamePattern(): string {
        return `^${getTestNamePattern(this)}$`;
    }
}
