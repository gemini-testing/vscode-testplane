import { browser } from "@wdio/globals";
import type { Workbench, SideBarView, ViewContent } from "wdio-vscode-service";

import { TestingViewSection } from "./view-section";

export class TestingSideBar {
    private _workbench: Workbench;
    private _sidebar: SideBarView<unknown>;
    private _sidebarView: ViewContent;

    constructor(workbench: Workbench) {
        this._workbench = workbench;
        this._sidebar = this._workbench.getSideBar();
        this._sidebarView = this._sidebar.getContent();
    }

    async getSections(): Promise<TestingViewSection[]> {
        const sections = await this._sidebarView.getSections();

        return sections.map(section => new TestingViewSection(section));
    }

    async waitTestsRead(): Promise<void> {
        await browser.waitUntil(
            async () => {
                const sections = await this._sidebarView.getSections();
                const firstTreeItemText = await sections[0].elem.$(".test-item .label").getText();

                return firstTreeItemText !== "Reading Testplane Tests...";
            },
            { timeout: 20000 },
        );
    }

    async runAllTests(): Promise<void> {
        // in order to show test explorer actions
        await this._sidebarView.elem.moveTo();

        const runTestsBtn = await this._sidebarView.elem.$("aria/Run Tests");
        await runTestsBtn.click();
    }

    async cancelTestRun(): Promise<void> {
        // in order to show test explorer actions
        await this._sidebarView.elem.moveTo();
        await this._sidebarView.elem.$(".codicon-testing-cancel-icon").click();
    }

    async waitTestsRunComplete(timeout: number = 30000): Promise<void> {
        await browser.waitUntil(
            async () => {
                const loadingItem = await this._sidebarView.elem.$(".result-summary .codicon-loading");
                const isExisting = await loadingItem.isExisting();

                return !isExisting;
            },
            { timeout },
        );
    }

    async getTestsRunStats(): Promise<string> {
        return (await this._sidebarView.elem.$(".result-summary > [custom-hover]")).getText();
    }
}
