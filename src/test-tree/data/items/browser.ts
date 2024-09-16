import { BaseTestData } from "./base";
import { TestCase } from "./test";
import { setTestData } from "../storage";
import type * as vscode from "vscode";

export class TestCaseByBrowser extends BaseTestData {
    static register(item: vscode.TestItem, parent: vscode.TestItem): TestCaseByBrowser {
        return setTestData(item, new TestCaseByBrowser(item, parent));
    }

    private constructor(item: vscode.TestItem, parent: vscode.TestItem) {
        super(item, parent);
    }

    getTestNamePattern(): string {
        return (this.parent as TestCase).getTestNamePattern();
    }

    getBrowserId(): string {
        return this.label;
    }
}

export const getUniqBrowserId = (testId: string, browserId: string): string => {
    return `${testId}/${browserId}`;
};
