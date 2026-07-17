import { CompletionItemKind, Connection, CompletionParams } from 'vscode-languageserver/node';

export default class Autocompleter {
    getCompletions(connection: Connection, params: CompletionParams) {

        connection.console.info('Autocompleting');
        // params example:
        // {"context":{"triggerKind":1},"textDocument":{"uri":"file:///Users/rein/Workspace/loom-lang/src/playground/index.loom"},"position":{"line":7,"character":5}}

        return [
            { label: 'extends', kind: CompletionItemKind.Keyword },
            { label: 'class', kind: CompletionItemKind.Keyword },
            { label: 'type', kind: CompletionItemKind.Keyword },
            { label: 'namespace', kind: CompletionItemKind.Keyword },
            { label: 'import', kind: CompletionItemKind.Keyword },
            { label: 'slot', kind: CompletionItemKind.Keyword },
        ];
    }
}