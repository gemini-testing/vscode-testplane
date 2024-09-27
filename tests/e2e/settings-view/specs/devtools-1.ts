import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Settings view", () => {
    describe("devtools", () => {
        it("should fail if option is not enabled", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testTreeItem = await firstSection.getVisibleItemByLabel("success");

            const runTestButton = await testTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("0/1");
        });
    });
});
