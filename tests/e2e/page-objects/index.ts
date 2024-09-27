import { browser } from "@wdio/globals";
import type { BottomBarPanel, Workbench, WebView } from "wdio-vscode-service";

import { TestingViewControl } from "./testing/view-control";
import { TestingSideBar } from "./testing/side-bar";

export class VSCodePO {
    private _workbench: Workbench;

    static async create<T extends VSCodePO>(this: new (workbench: Workbench) => T): Promise<T> {
        const workbench = await browser.getWorkbench();

        return new this(workbench);
    }

    constructor(workbench: Workbench) {
        this._workbench = workbench;
    }

    getTestingViewControl(): TestingViewControl {
        return new TestingViewControl(this._workbench);
    }

    getTestingSideBar(): TestingSideBar {
        return new TestingSideBar(this._workbench);
    }

    getBottomBar(): BottomBarPanel {
        return this._workbench.getBottomBar();
    }

    getWebviewByTitle(title: string): Promise<WebView> {
        return this._workbench.getWebviewByTitle(title);
    }
}

export * from "./testing";
