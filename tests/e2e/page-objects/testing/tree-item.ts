import { browser } from "@wdio/globals";
import { Key } from "webdriverio";
import _ from "lodash";
import type { TreeItem, ViewItemAction } from "wdio-vscode-service";

export class TestingTreeItem {
    private _treeItem: TreeItem;

    constructor(treeItem: TreeItem) {
        this._treeItem = treeItem;
    }

    async expandAll(): Promise<void> {
        await browser.performActions([
            {
                type: "key",
                id: "keyboard",
                actions: [{ type: "keyDown", value: Key.Alt }],
            },
        ]);
        await this._treeItem.elem.click();
        await browser.performActions([
            {
                type: "key",
                id: "keyboard",
                actions: [{ type: "keyUp", value: Key.Alt }],
            },
        ]);
    }

    async getLabel(): Promise<string> {
        return this._treeItem.elem.$(".label").getText();
    }

    async getTestsFullTitle(): Promise<string[]> {
        return getFullTitles([this._treeItem]);
    }

    async getAriaLabelAttr(): Promise<string> {
        return (await this._treeItem.elem).getAttribute("aria-label");
    }

    async getActionButton(label: string): Promise<ViewItemAction | undefined> {
        return this._treeItem.getActionButton(label);
    }
}

async function getFullTitles(treeItems: TreeItem[]): Promise<string[]> {
    return _.flatten(
        await Promise.all(
            treeItems.map(async (treeItem: TreeItem): Promise<string | string[]> => {
                const treeItemLabel = await treeItem.elem.$(".label").getText();

                if (await treeItem.hasChildren()) {
                    const labels = await getFullTitles(await treeItem.getChildren());
                    return labels.map(label => `${treeItemLabel} ${label}`);
                }

                return treeItemLabel;
            }),
        ),
    );
}
