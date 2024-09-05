import { browser } from "@wdio/globals";
import type { Workbench } from "wdio-vscode-service";

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
}

export * from "./testing";
