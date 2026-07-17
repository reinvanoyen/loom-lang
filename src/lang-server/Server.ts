import {
    createConnection,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    TextDocuments,
    TextDocumentSyncKind
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import Autocompleter from '@/lang-server/Autocompleter';
import Validator from '@/lang-server/Validator';

export default class Server {
    public start() {

        const autocompleter = new Autocompleter();
        const validator = new Validator();

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
                    completionProvider: {
                        resolveProvider: false,
                        triggerCharacters: ['.', '@'],
                    },
                },
            };
        });

        documents.onDidOpen((event) => {
            connection.console.info('Opened');
            validator.validate(connection, event.document);
        });

        documents.onDidChangeContent((event) => {
            connection.console.info('Changed');
            validator.validate(connection, event.document);
        });

        documents.onDidClose((event) => {
            connection.console.info('Closed');
            connection.sendDiagnostics({
                uri: event.document.uri,
                diagnostics: [],
            });
        });

        connection.onCompletion((params) => {
            connection.console.info('Autocompletion');
            return autocompleter.getCompletions(connection, params);
        });

        documents.listen(connection);
        connection.listen();
    }
}