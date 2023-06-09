const { transformAsync } = require("@babel/core");
const t = require("@babel/types");
const syntaxFlow = require("@babel/plugin-syntax-flow");

module.exports = async function addImport({ code, componentName }) {
  let foundExistingImport = false;
  let output;
  const importLibraryName =
    componentName.includes("YAP") || componentName.includes("Icon")
      ? "@yapsody/ansh-ui"
      : "@yapsody/lib-ui-standards";

  try {
    output = await transformAsync(code, {
      configFile: false,
      compact: false,
      retainLines: true,
      plugins: [
        syntaxFlow,
        function AddAnshComponentImportPlugin() {
          return {
            visitor: {
              ImportDeclaration(path) {
                if (path.node.source.value !== importLibraryName) {
                  return;
                }

                foundExistingImport = true;
                const hasComponentImport = path.node.specifiers.find(
                  (node) =>
                    t.isImportSpecifier(node) &&
                    t.isIdentifier(node.imported) &&
                    node.imported.name === componentName
                );
                if (!hasComponentImport) {
                  const newSpecifier = t.importSpecifier(
                    t.identifier(componentName),
                    t.identifier(componentName)
                  );
                  path.node.specifiers.push(newSpecifier);
                  path.node.specifiers = path.node.specifiers.sort(
                    (specifierA, specifierB) => {
                      if (
                        !t.isImportSpecifier(specifierA) ||
                        !t.isImportSpecifier(specifierB) ||
                        !t.isIdentifier(specifierA.imported) ||
                        !t.isIdentifier(specifierB.imported)
                      ) {
                        return 0;
                      }
                      if (specifierA.imported.name > specifierB.imported.name) {
                        return 1;
                      }
                      if (specifierA.imported.name < specifierB.imported.name) {
                        return -1;
                      }
                      return 0;
                    }
                  );
                }
              },
            },
          };
        },
      ],
    });
  } catch (error) {
    console.log(`addImport Error - ${error.message} - ${error}`);
  }

  if (!foundExistingImport) {
    return `${code}
import { ${componentName} } from  "${importLibraryName}";`.trim();
  } else {
    return output && output.code !== undefined && output.code !== null
      ? output.code
      : "";
  }
};
