import { browser, expect } from "@wdio/globals";
import type { Workbench, ViewControl } from "wdio-vscode-service";

const VIEW_CONTROL_NAME = "Testing";

export class TestingViewControl {
    private _workbench: Workbench;

    constructor(workbench: Workbench) {
        this._workbench = workbench;
    }

    async open(): Promise<void> {
        const activityBar = this._workbench.getActivityBar();
        const testingViewControl = (await browser.waitUntil(() =>
            activityBar.getViewControl(VIEW_CONTROL_NAME),
        )) as ViewControl;

        await testingViewControl.openView();

        const selectedView = await this._workbench.getActivityBar().getSelectedViewAction();
        expect(await selectedView.getTitle()).toBe(VIEW_CONTROL_NAME);
    }
}
