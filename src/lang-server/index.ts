import {
    createConnection,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    TextDocuments,
    TextDocumentSyncKind,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Compiler } from '@/compiler';
import Transformer from '@/lang-server/Transformer';
import { fileURLToPath } from 'node:url';

const transformer = new Transformer();

const connection = createConnection(
    ProposedFeatures.all,
    process.stdin,
    process.stdout,
);

const documents = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
    connection.console.info('Loom LSP initialized');

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
        },
    };
});

documents.onDidOpen((event) => {
    connection.console.info(`Opened ${event.document.uri}`);
    validateDocument(event.document);
});

documents.onDidChangeContent((event) => {
    connection.console.info(`Changed ${event.document.uri}`);
    validateDocument(event.document);
});

documents.onDidClose((event) => {
    connection.console.info(`Closed ${event.document.uri}`);
    connection.sendDiagnostics({
        uri: event.document.uri,
        diagnostics: [],
    });
});

async function validateDocument(document: TextDocument): Promise<void> {
    const sourceText = document.getText();
    const filename = fileURLToPath(document.uri);

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

documents.listen(connection);
connection.listen();