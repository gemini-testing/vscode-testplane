import { TEST_DATA_BY_ITEM } from "./constants";

import type * as vscode from "vscode";
import type { TestData } from "./types";

export const getTestData = (item: vscode.TestItem): TestData => {
    const data = TEST_DATA_BY_ITEM.get(item);

    if (!data) {
        throw new Error(
            `Test data not found for "${item.label}". Please report it to https://github.com/gemini-testing/testplane/issues`,
        );
    }

    return data;
};

export const setTestData = <T extends TestData>(item: vscode.TestItem, data: T): T => {
    TEST_DATA_BY_ITEM.set(item, data);

    return data;
};
