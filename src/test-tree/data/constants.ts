import type * as vscode from "vscode";
import type { TestData } from "./types";

export const TEST_DATA_BY_ITEM = new WeakMap<vscode.TestItem, TestData>();
