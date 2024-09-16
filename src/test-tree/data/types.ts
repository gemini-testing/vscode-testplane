import { TestFolder } from "./items/folder";
import { TestFile } from "./items/file";
import { TestSuite } from "./items/suite";
import { TestCase } from "./items/test";
import { TestCaseByBrowser } from "./items/browser";

export type TestData = TestFolder | TestFile | TestSuite | TestCase | TestCaseByBrowser;
