import { BaseTestData } from "./base";
import { setTestData } from "../storage";
import { getTestNamePattern } from "../utils";
import type * as vscode from "vscode";

export class TestSuite extends BaseTestData {
    static register(item: vscode.TestItem, parent: vscode.TestItem): TestSuite {
        return setTestData(item, new TestSuite(item, parent));
    }

    private constructor(item: vscode.TestItem, parent: vscode.TestItem) {
        super(item, parent);
    }

    getTestNamePattern(): string {
        return `^${getTestNamePattern(this)}`;
    }
}
