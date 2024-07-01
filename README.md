# vscode-testplane

This extension supports [Testplane][testplane] features in VS Code environment. Available features:

- [Install Testplane](#install-testplane)
- [Using the REPL mode](#using-the-repl-mode)

## Install Testplane

If you are not using testplane yet or starting a new testing project, the "Install Testplane" action from the command panel will help you get started.

## Using the REPL mode

Adds a keybinding (`cmd+shift+8` for mac and `ctrl+shift+8` for others) to run a dedicated section of code in the VSCode terminal. More info about [REPL mode][testplane-repl-mode]. You can overwrite this keybinding in [keyboard shortcuts][vscode-keyboard-shortcuts].

[testplane]: https://github.com/gemini-testing/testplane
[testplane-repl-mode]: https://github.com/gemini-testing/testplane/blob/master/docs/cli.md#repl-mode
[vscode-keyboard-shortcuts]: https://code.visualstudio.com/docs/getstarted/keybindings
