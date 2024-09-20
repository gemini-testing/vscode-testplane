import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Testing view in sidebar", () => {
    describe("run tests", () => {
        it("should correctly show test statistics after run all tests", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();
            await sidebar.runAllTests();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("2/3");

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();
            await mainTreeItem.expandAll();

            const items = await firstSection.getVisibleItems();

            await expect(items).toHaveLength(11);
            await expect(await items[0].getAriaLabelAttr()).toContain("tests (Failed)");
            await expect(await items[1].getAriaLabelAttr()).toContain("test.testplane.ts (Failed)");
            await expect(await items[2].getAriaLabelAttr()).toContain("suite (Failed)");
            await expect(await items[3].getAriaLabelAttr()).toContain("success (Passed)");
            await expect(await items[4].getAriaLabelAttr()).toContain("chrome (Passed)");
            await expect(await items[5].getAriaLabelAttr()).toContain("fail (Failed)");
            await expect(await items[6].getAriaLabelAttr()).toContain("chrome (Failed)");
            await expect(await items[7].getAriaLabelAttr()).toContain("skipped (Skipped)");
            await expect(await items[8].getAriaLabelAttr()).toContain("chrome (Skipped)");
            await expect(await items[9].getAriaLabelAttr()).toContain("test without suite (Passed)");
            await expect(await items[10].getAriaLabelAttr()).toContain("chrome (Passed)");
        });
    });
});
