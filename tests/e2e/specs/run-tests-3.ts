import { expect } from "@wdio/globals";
import { VSCodePO } from "../page-objects";

describe("Testing view in sidebar", () => {
    describe("run tests", () => {
        it("should run only one test by click on test item", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testTreeItem = await firstSection.getVisibleItemByLabel("test without suite");

            const runTestButton = await testTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("1/1");
        });
    });
});
