import { Connection } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { fileURLToPath } from 'node:url';
import { Compiler } from '@/compiler';
import Transformer from '@/lang-server/Transformer';

export default class Validator {
    public validate(connection: Connection, document: TextDocument) {

        const transformer = new Transformer();
        const sourceText = document.getText();
        const filename = fileURLToPath(document.uri);

        connection.console.info(`Validating ${filename}`);

        try {
            const result = new Compiler().analyzeFromSource(sourceText, filename, {
                printDiagnostics: false,
                printEmissionModel: false,
                printSymbolTable: false,
                printTypeTable: false,
                printBoundAst: false,
                verbose: false,
            });

            result.diagnostics.getMessages().forEach(message => {
                connection.console.log(message.message);
            });

            const diagnostics = transformer.toDiagnostics(result.diagnostics);

            connection.sendDiagnostics({
                uri: document.uri,
                diagnostics,
            });

        } catch (error) {

            connection.console.error(
                error instanceof Error ? error.stack ?? error.message : String(error),
            );
        }
    }
}