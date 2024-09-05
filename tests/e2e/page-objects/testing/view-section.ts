import type { ViewSection, CustomTreeItem } from "wdio-vscode-service";
import { TestingTreeItem } from "../";

export class TestingViewSection {
    private _section: ViewSection;

    constructor(section: ViewSection) {
        this._section = section;
    }

    async getLabel(): Promise<string> {
        return this._section.elem.$(".label").getText();
    }

    async getVisibleItems(): Promise<TestingTreeItem[]> {
        const items = (await this._section.getVisibleItems()) as CustomTreeItem[];

        return items.map(item => new TestingTreeItem(item));
    }

    async getVisibleItemByLabel(label: string): Promise<TestingTreeItem | null> {
        const items = await this.getVisibleItems();
        const itemsLabel = await Promise.all(
            items.map(async item => {
                const itemLabel = await item.getLabel();

                return itemLabel === label ? item : null;
            }),
        ).then(res => res.filter(Boolean));

        return itemsLabel[0];
    }
}
