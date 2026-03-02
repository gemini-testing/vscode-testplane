# Development

How to build and test the extension:

- Run `npm install` to install deps;
- Run `npm run watch`;
- Press F5 to run extension.

## Release Process

To publish a new version of the extension to both the VS Code Marketplace and the Open VSX Registry (which Cursor uses):

1. **Bump Version:**
   Run the release script to bump the version in `package.json`, update `CHANGELOG.md`, and create a release commit/tag:
   ```bash
   npm run release
   ```

2. **Push Changes:**
   Push the commit and tags to the repository:
   ```bash
   git push --follow-tags origin master
   ```

3. **Package the Extension:**
   To ensure the exact same build is published to both registries, package the extension into a `.vsix` file first:
   ```bash
   vsce package
   ```
   *This will generate a file named `vscode-testplane-<version>.vsix` (e.g., `vscode-testplane-1.3.1.vsix`).*

4. **Publish to VS Code Marketplace:**
   Ensure you have the `@vscode/vsce` CLI installed (`npm i -g @vscode/vsce`). You need a valid publisher Personal Access Token (can be created in Azure DevOps).
   ```bash
   # Login if you haven't already
   vsce login gemini-testing

   # Publish the packaged extension
   vsce publish vscode-testplane-<version>.vsix
   ```

5. **Publish to Open VSX (For Cursor):**
   Cursor relies on the Open VSX registry for extensions. Ensure you have the `ovsx` CLI installed (`npm i -g ovsx`).

   **Token Setup:** You need a valid Open VSX access token. You can generate one by logging into [open-vsx.org](https://open-vsx.org/), navigating to your **Settings**, and creating a new token under **Access Tokens**.

   ```bash
   # Assuming you have set OVSX_PAT as an environment variable
   ovsx publish vscode-testplane-<version>.vsix -p $OVSX_PAT
   ```
