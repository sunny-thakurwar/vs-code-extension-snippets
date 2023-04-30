const vscode = require("vscode");
const snippet = require("./snippet.json");
const { SnippetParser } = require("vscode-snippet-parser");

const { CompletionList, Range, SnippetString, MarkdownString } = vscode;

class SnippetCompletionItem {
  constructor({ label, prefix, text, range }) {
    this.label = prefix;
    this.insertText = text;
    this.range = range;
    this.detail = label;
    this.kind = "Snippet";
    this.command = {
      title: "auto import",
      command: "snippet-generator-.auto_import",
      arguments: [
        {
          component: prefix.replace("<", ""),
        },
      ],
    };
  }

  resolve() {
    const text = new SnippetParser().text(
      this.insertText != null ? this.insertText.value : ""
    );
    this.documentation = new MarkdownString().appendCodeblock(text);

    return this;
  }
}

class SnippetCompletionItemProvider {
  async resolveCompletionItem(item) {
    return item instanceof SnippetCompletionItem ? item.resolve() : item;
  }
  async provideCompletionItems(document, position) {
    const textBeforeCursor = document
      .getText(document.lineAt(position.line).range)
      .trim();
    if (!textBeforeCursor) {
      return undefined;
    }

    return new CompletionList(
      snippet
        .filter(({ prefix }) => {
          return prefix
            .toLocaleLowerCase()
            .startsWith(textBeforeCursor.toLocaleLowerCase());
        })
        .map(({ prefix, body, name }) => {
          const text = body.join("\n");
          const label = `ansh ${name}`;
          return new SnippetCompletionItem({
            label,
            prefix,
            range: new Range(
              position.translate(0, -textBeforeCursor.length),
              position
            ),
            text: new SnippetString(text),
            textBeforeCursorLength: textBeforeCursor.length,
            snippetLength: text.length,
          });
        })
    );
  }
}

module.exports = SnippetCompletionItemProvider;
