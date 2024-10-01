import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe(".vscode/settings.json", () => {
    it("should use config path from user settings", async () => {
        const vscodePO = await VSCodePO.create();
        const testingViewControl = vscodePO.getTestingViewControl();
        await testingViewControl.open();

        const sidebar = vscodePO.getTestingSideBar();
        await sidebar.waitTestsRead();

        const [firstSection] = await sidebar.getSections();
        const visibleItems = await firstSection.getVisibleItems();

        expect(visibleItems).toHaveLength(1);
    });
});
