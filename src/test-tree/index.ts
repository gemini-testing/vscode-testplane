import * as vscode from "vscode";
import { basename, dirname, normalize, resolve } from "pathe";
import { TestFolder, TestFile, TestSuite, TestCase, TestCaseByBrowser, getTestData, getUniqBrowserId } from "./data";
import type { FormatterTreeMainRunnable, FormatterTreeSuite, FormatterTreeTest } from "testplane";

export class TestTree extends vscode.Disposable {
    private _folderItems = new Map<string, vscode.TestItem>();
    private _fileItems = new Map<string, vscode.TestItem>();
    private _runnableItems = new Map<string, vscode.TestItem>();
    private _browserItems = new Map<string, vscode.TestItem>();
    private _watcherByFolder = new Map<vscode.WorkspaceFolder, vscode.FileSystemWatcher>();

    static create<T extends TestTree>(
        this: new (controller: vscode.TestController, loaderItem: vscode.TestItem) => T,
        controller: vscode.TestController,
        loaderItem: vscode.TestItem,
    ): T {
        return new this(controller, loaderItem);
    }

    constructor(
        private readonly _controller: vscode.TestController,
        private readonly _loaderItem: vscode.TestItem,
    ) {
        super(() => {
            this._disposeTestTreeItems();
            this._disposeWatchers();
        });
    }

    async registerWorkspaceTests(wf: vscode.WorkspaceFolder, tests: FormatterTreeMainRunnable[]): Promise<void> {
        await this._registerTests(wf, tests);
        await this._watchTestFiles(wf);
    }

    reset(workspaceFolders: readonly vscode.WorkspaceFolder[]): void {
        this._disposeTestTreeItems();
        this._disposeWatchers();

        this._loaderItem.busy = true;

        if (workspaceFolders.length === 1) {
            const rootItem = this._getOrCreateWorkspaceInlineFolderItem(workspaceFolders[0].uri);
            rootItem.children.replace([this._loaderItem]);

            return;
        }

        const folderItems = workspaceFolders.map(wf => {
            const item = this._getOrCreateWorkspaceFolderItem(wf.uri);
            item.children.replace([]);
            item.busy = true;
            return item;
        });

        this._controller.items.replace(folderItems);
    }

    getBrowserTestItemById(uniqBrowserId: string): vscode.TestItem | undefined {
        return this._browserItems.get(uniqBrowserId);
    }

    getBrowserTestItemsByFolderPath(folderPath: string): vscode.TestItem[] {
        const folderItem = this._getOrCreateFolderTestItem(normalize(folderPath));
        return this._getBrowserTestItemsByParent(folderItem);
    }

    private _disposeTestTreeItems(): void {
        this._folderItems.clear();
        this._fileItems.clear();
        this._runnableItems.clear();
        this._browserItems.clear();
    }

    private _disposeWatchers(): void {
        this._watcherByFolder.forEach(x => x.dispose());
        this._watcherByFolder.clear();
    }

    async _registerTests(wf: vscode.WorkspaceFolder, tests: FormatterTreeMainRunnable[]): Promise<void> {
        const folderItem = this._folderItems.get(normalize(wf.uri.fsPath));

        if (folderItem) {
            folderItem.busy = false;
        }

        for (const runnable of tests) {
            const fullPath = resolve(wf.uri.fsPath, runnable.file);
            const fileTestItem = this._getOrCreateFileTestItem(fullPath);
            const testFile = getTestData(fileTestItem) as TestFile;

            this._createRunnables(testFile, runnable, fileTestItem);
        }
    }

    private async _watchTestFiles(wf: vscode.WorkspaceFolder): Promise<void> {
        if (this._watcherByFolder.has(wf)) {
            return;
        }

        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(wf, "**/*"));

        this._watcherByFolder.set(wf, watcher);

        watcher.onDidDelete(file => {
            const filePath = normalize(file.fsPath);
            const testItem = this._fileItems.get(filePath) || this._folderItems.get(filePath);

            if (testItem) {
                this._deleteChildsRecursively(testItem);
                this._deleteParentsRecursively(testItem);
            }
        });
    }

    // used when there is only one workspace, which is not displayed in Testing view,
    // but required to correctly resolve the parent item.
    private _getOrCreateWorkspaceInlineFolderItem(folderUri: vscode.Uri): vscode.TestItem {
        const folderId = normalize(folderUri.fsPath);
        const cached = this._folderItems.get(folderId);
        if (cached) {
            return cached;
        }

        const folderItem: vscode.TestItem = {
            id: folderId,
            children: this._controller.items,
            uri: folderUri,
            label: "<root>",
            canResolveChildren: false,
            busy: false,
            parent: undefined,
            tags: [],
            range: undefined,
            error: undefined,
        };

        TestFolder.register(folderItem);
        this._folderItems.set(folderId, folderItem);

        return folderItem;
    }

    private _getOrCreateWorkspaceFolderItem(folderUri: vscode.Uri): vscode.TestItem {
        const folderId = normalize(folderUri.fsPath);
        const cached = this._folderItems.get(folderId);
        if (cached) {
            return cached;
        }

        const folderItem = this._createFolderItem(folderUri);
        this._folderItems.set(folderId, folderItem);

        return folderItem;
    }

    private _createFolderItem(folderUri: vscode.Uri, parentItem?: vscode.TestItem): vscode.TestItem {
        const folderId = normalize(folderUri.fsPath);
        const folderItem = this._controller.createTestItem(folderId, basename(folderId), folderUri);

        TestFolder.register(folderItem, parentItem);

        return folderItem;
    }

    private _getOrCreateFolderTestItem(normalizedFolder: string): vscode.TestItem {
        const cached = this._folderItems.get(normalizedFolder);
        if (cached) {
            return cached;
        }

        const folderUri = vscode.Uri.file(normalizedFolder);
        const parentItem = this._getOrCreateFolderTestItem(dirname(normalizedFolder));
        const folderItem = this._createFolderItem(folderUri, parentItem);

        parentItem.children.add(folderItem);
        this._folderItems.set(normalizedFolder, folderItem);

        return folderItem;
    }

    private _getOrCreateFileTestItem(file: string): vscode.TestItem {
        const normalizedFile = normalize(file);
        const fileId = `${normalizedFile}`;
        const cached = this._fileItems.get(fileId);

        if (cached) {
            return cached;
        }

        const fileUri = vscode.Uri.file(file);
        const parentItem = this._getOrCreateFolderTestItem(dirname(file));
        const label = basename(file);

        const testFileItem = this._controller.createTestItem(fileId, label, fileUri);

        const position = new vscode.Position(0, 1);
        testFileItem.range = new vscode.Range(position, position);

        TestFile.register(testFileItem, parentItem, normalizedFile);

        parentItem.children.add(testFileItem);
        this._fileItems.set(fileId, testFileItem);

        return testFileItem;
    }

    private _createRunnables(
        testFile: TestFile,
        runnable: FormatterTreeSuite | FormatterTreeTest,
        parent: vscode.TestItem,
    ): void {
        const testItem = this._createRunnableTestItem(runnable, parent);
        this._runnableItems.set(runnable.id, testItem);
        parent.children.add(testItem);

        if (isTreeTest(runnable)) {
            TestCase.register(testItem, parent);

            runnable.browserIds.forEach(browserId => {
                const browserItem = this._createBrowserTestItem(browserId, testItem);
                this._browserItems.set(browserItem.id, browserItem);

                TestCaseByBrowser.register(browserItem, testItem);
                testItem.children.add(browserItem);
            });

            return;
        }

        TestSuite.register(testItem, parent);

        for (const suite of runnable.suites) {
            this._createRunnables(testFile, suite, testItem);
        }

        for (const test of runnable.tests) {
            this._createRunnables(testFile, test, testItem);
        }
    }

    private _createRunnableTestItem(
        runnable: FormatterTreeSuite | FormatterTreeTest,
        parent: vscode.TestItem,
    ): vscode.TestItem {
        const testItem = this._controller.createTestItem(runnable.id, runnable.title, parent.uri);

        const position = new vscode.Position(runnable.line - 1, runnable.column);
        testItem.range = new vscode.Range(position, position);

        return testItem;
    }

    private _createBrowserTestItem(browserId: string, parent: vscode.TestItem): vscode.TestItem {
        const uniqBrowserId = getUniqBrowserId(parent.id, browserId);
        const testItem = this._controller.createTestItem(uniqBrowserId, browserId, parent.uri);
        testItem.range = parent.range;

        return testItem;
    }

    private _deleteChildsRecursively(item: vscode.TestItem): void {
        if (item.children?.size === 0) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, child] of item.children) {
            this._deleteTestData(child);
            this._deleteChildsRecursively(child);
        }
    }

    private _deleteParentsRecursively(item: vscode.TestItem): void {
        if (!item.parent) {
            return;
        }

        item.parent.children.delete(item.id);
        this._deleteTestData(item);

        if (item.parent.children.size === 0) {
            this._deleteParentsRecursively(item.parent);
        }
    }

    private _deleteTestData(item: vscode.TestItem): void {
        const data = getTestData(item);

        if (data instanceof TestFolder) {
            this._folderItems.delete(item.id);
        } else if (data instanceof TestFile) {
            this._fileItems.delete(item.id);
        } else if (data instanceof TestSuite || data instanceof TestCase) {
            this._runnableItems.delete(item.id);
        } else if (data instanceof TestCaseByBrowser) {
            this._browserItems.delete(item.id);
        }
    }

    private _getBrowserTestItemsByParent(parent: vscode.TestItem): vscode.TestItem[] {
        const browserItems: vscode.TestItem[] = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, item] of parent.children) {
            const data = getTestData(item);

            if (data instanceof TestCaseByBrowser) {
                browserItems.push(item);
            } else {
                browserItems.push(...this._getBrowserTestItemsByParent(item));
            }
        }

        return browserItems;
    }
}

function isTreeTest(runnable: unknown): runnable is FormatterTreeTest {
    return Boolean((runnable as FormatterTreeTest).browserIds);
}
