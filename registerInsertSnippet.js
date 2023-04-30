const vscode = require("vscode");
const addImport = require("./addImport");

async function insertSnippet({ component }) {
  // auto import

  const document = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.document
    : undefined;

  const allTextRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  const allText = document.getText(allTextRange);

  const lastImportLine = allText
    .split("\n")
    .reduce((acc, currentValue, currentIndex) => {
      if (currentValue.startsWith("import ")) {
        acc = currentIndex;
      }
      return acc;
    }, 0);

  const untilLastImportRange = new vscode.Range(
    document.positionAt(0),
    document.lineAt(lastImportLine).range.end
  );

  const untilLastImport = document.getText(untilLastImportRange);

  let transformedCode = "";

  try {
    transformedCode = await addImport({
      code: untilLastImport,
      componentName: component,
    });
  } catch (error) {
    console.log(error);
  }

  vscode.window.activeTextEditor.edit((builder) => {
    if (transformedCode) {
      builder.replace(untilLastImportRange, transformedCode);
    }
  });
  await vscode.commands.executeCommand("editor.action.formatDocument");
}

module.exports = function registerInsertSnippet() {
  vscode.commands.registerCommand(
    "snippet-generator-.auto_import",
    insertSnippet
  );
};
