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
            await browser.$("[settingname=devtools]").click();
            await browser.$("[settingname=repl]").click();
            await webview.close();

            const [firstSection] = await sidebar.getSections();
            const [mainTreeItem] = await firstSection.getVisibleItems();

            await mainTreeItem.expandAll();
            const testTreeItem = await firstSection.getVisibleItemByLabel("should switch to REPL mode");

            const runTestButton = await testTreeItem!.getActionButton("Run Test");
            await runTestButton?.elem.click();

            const bottomBarPanel = vscodePO.getBottomBar();
            const outputView = await bottomBarPanel.openOutputView();
            await outputView.selectChannel("Testplane");

            await browser.waitUntil(
                async () => {
                    const outputText = await outputView.getText();

                    return outputText.some(textLine => /You have entered to REPL mode via terminal/.test(textLine));
                },
                { timeout: 10000, timeoutMsg: "REPL mode was not turned on" },
            );

            await sidebar.cancelTestRun();
        });
    });
});
