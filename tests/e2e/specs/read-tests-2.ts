import { expect } from "@wdio/globals";
import { VSCodePO } from "../page-objects";

describe("Testing view in sidebar", () => {
    describe("read tests", () => {
        it("should correctly render tests tree", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testsFullTitle = await mainTreeItem.getTestsFullTitle();

            expect(testsFullTitle).toEqual([
                "tests test.testplane.ts suite success chrome",
                "tests test.testplane.ts suite fail chrome",
                "tests test.testplane.ts suite skipped chrome",
                "tests test.testplane.ts test without suite chrome",
            ]);
        });
    });
});
