import { VSCodePO } from "../../page-objects";

describe("Settings view", () => {
    describe("repl", () => {
        it("should throw error if repl is enabled and user runs more than one test", async () => {
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

            await sidebar.runAllTests();

            const bottomBarPanel = vscodePO.getBottomBar();
            const outputView = await bottomBarPanel.openOutputView();
            await outputView.selectChannel("Testplane");

            await browser.waitUntil(
                async () => {
                    const outputText = await outputView.getText();

                    return outputText.some(textLine =>
                        /In repl mode only 1 test in 1 browser should be run, but found 2 tests that run in chrome browsers/.test(
                            textLine,
                        ),
                    );
                },
                { timeout: 10000, timeoutMsg: "REPL mode was not turned on" },
            );
        });
    });
});
