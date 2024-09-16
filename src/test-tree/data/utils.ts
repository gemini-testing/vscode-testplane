import _ from "lodash";
import { TestFolder } from "./items/folder";
import { TestFile } from "./items/file";
import type { TestData } from "./types";

export const getTestNamePattern = (testData: TestData): string => {
    const patterns = [_.escapeRegExp(testData.label)];
    let parent = testData.parent;

    while (parent) {
        if (parent instanceof TestFolder || parent instanceof TestFile) {
            break;
        }

        patterns.push(_.escapeRegExp(parent.label));
        parent = parent.parent;
    }

    return patterns.reverse().join(" ");
};
