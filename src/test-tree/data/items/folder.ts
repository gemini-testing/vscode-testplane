import { BaseTestData } from "./base";
import { setTestData } from "../storage";
import type * as vscode from "vscode";

export class TestFolder extends BaseTestData {
    static register(item: vscode.TestItem, parent?: vscode.TestItem): TestFolder {
        return setTestData(item, new TestFolder(item, parent));
    }

    private constructor(item: vscode.TestItem, parent?: vscode.TestItem) {
        super(item, parent);
    }
}
