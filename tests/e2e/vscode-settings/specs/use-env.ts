import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe(".vscode/settings.json", () => {
    it("should be skipped by 'TESTPLANE_SKIP_BROWSERS' env variable from user settings", async () => {
        const vscodePO = await VSCodePO.create();
        const testingViewControl = vscodePO.getTestingViewControl();
        await testingViewControl.open();

        const sidebar = vscodePO.getTestingSideBar();
        await sidebar.waitTestsRead();
        await sidebar.runAllTests();
        await sidebar.waitTestsRunComplete();

        await expect(await sidebar.getTestsRunStats()).toBe("0/0");

        const [firstSection] = await sidebar.getSections();
        const [mainTreeItem] = await firstSection.getVisibleItems();
        await mainTreeItem.expandAll();

        const items = await firstSection.getVisibleItems();

        await expect(await items[0].getAriaLabelAttr()).toContain("tests (Skipped)");
    });
});
