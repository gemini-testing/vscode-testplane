import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Testing view in sidebar", () => {
    describe("run tests", () => {
        it("should run only child tests by click on suite item", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const suiteTreeItem = await firstSection.getVisibleItemByLabel("suite");

            const runTestButton = await suiteTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("1/2");
        });
    });
});
