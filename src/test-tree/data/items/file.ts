import { BaseTestData } from "./base";
import { setTestData } from "../storage";
import type * as vscode from "vscode";

export class TestFile extends BaseTestData {
    static register(item: vscode.TestItem, parent: vscode.TestItem, filepath: string): TestFile {
        return setTestData(item, new TestFile(item, parent, filepath));
    }

    private constructor(
        item: vscode.TestItem,
        parent: vscode.TestItem,
        readonly filepath: string,
    ) {
        super(item, parent);
    }
}
