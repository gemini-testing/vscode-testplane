import { expect } from "@wdio/globals";
import { VSCodePO } from "../../page-objects";

describe("Testing view in sidebar", () => {
    describe("read tests", () => {
        it("should render loader or main folder item in tree", async () => {
            const vscodePO = await VSCodePO.create();
            const testingViewControl = vscodePO.getTestingViewControl();
            await testingViewControl.open();

            const sidebar = vscodePO.getTestingSideBar();
            const [firstSection] = await sidebar.getSections();
            const firstItemLabel = await firstSection.getLabel();

            // when running tests in CI the loader item can disappear before start check the label name
            try {
                expect(firstItemLabel).toBe("Reading Testplane Tests...");
            } catch (err) {
                if (process.env.RUN_IN_CI) {
                    expect(firstItemLabel).toBe("tests");
                } else {
                    throw err;
                }
            }
        });
    });
});
