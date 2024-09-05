import { TEST_DATA_BY_ITEM } from "../constants";

import type * as vscode from "vscode";
import type { TestData } from "../types";

export class BaseTestData {
    readonly id: string;
    readonly label: string;
    readonly parent: TestData | undefined;

    constructor(item: vscode.TestItem, parent?: vscode.TestItem) {
        this.id = item.id;
        this.label = item.label;
        this.parent = parent ? TEST_DATA_BY_ITEM.get(parent) : undefined;
    }
}
