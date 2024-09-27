import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Settings view", () => {
    describe("repl", () => {
        it("should fail if option is not enabled", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            await sidebar.waitTestsRead();

            const webview = await vscodePO.getWebviewByTitle("Testplane");
            await webview.open();
            // enable devtools in order to not fail (grid url does not work)
            await browser.$("[settingname=devtools]").click();
            await webview.close();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testTreeItem = await firstSection.getVisibleItemByLabel("should switch to REPL mode");

            const runTestButton = await testTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();
            await sidebar.waitTestsRunComplete();

            await expect(await sidebar.getTestsRunStats()).toBe("0/1");
        });
    });
});
