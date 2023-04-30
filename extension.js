// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const SnippetCompletionItemProvider = require("./SnippetCompletionItemProvider");
const registerInsertSnippet = require("./registerInsertSnippet");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

const documentSelector = [
  "javascript",
  "javascriptreact",
  "jsx",
  "plaintext",
  "typescript",
  "typescriptreact",
];

const triggerCharacters = ["<"];

const snippetCompletionProvider = new SnippetCompletionItemProvider();
function addProviders() {
  const subscriptions = [
    vscode.languages.registerCompletionItemProvider(
      documentSelector,
      snippetCompletionProvider,
      ...triggerCharacters
    ),
  ];

  return vscode.Disposable.from(...subscriptions);
}

function registerCommands() {
  registerInsertSnippet();
}

function activate() {
  console.log(
    'Congratulations, your extension "snippet-generator" is now active!'
  );

  addProviders();
  registerCommands();
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
