import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Activation on open Testing bar", () => {
    it("should do not try to read tests", async () => {
        const vscodePO = await VSCodePO.create();
        const testingViewControl = vscodePO.getTestingViewControl();
        await testingViewControl.open();

        const sidebar = vscodePO.getTestingSideBar();
        const [firstSection] = await sidebar.getSections();
        const items = await firstSection.getVisibleItems();

        expect(items).toHaveLength(0);

        const webview = await vscodePO.getWebviewByTitle("Testplane");
        expect(webview.elem).toBeDisplayed();
    });
});
