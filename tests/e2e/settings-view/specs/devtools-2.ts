import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Settings view", () => {
    describe("devtools", () => {
        it("should pass if option is enabled", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const webview = await vscodePO.getWebviewByTitle("Testplane");
            await webview.open();
            await browser.$("[settingname=devtools]").click();
            await webview.close();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testTreeItem = await firstSection.getVisibleItemByLabel("success");

            const runTestButton = await testTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("1/1");
        });
    });
});
