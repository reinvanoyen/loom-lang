import { Diagnostics } from '@/compiler';
import { MessageCode } from '@/compiler/Diagnostics';
import { DiagnosticSeverity } from 'vscode-languageserver/node';

/**
 * Transformer is responsible for transforming Compiler-specific structures to the structures LSP needs
 */
export default class Transformer {
    /**
     * @param severity
     */
    public toDiagnosticSeverity(severity: 'info' | 'warning' | 'error'): DiagnosticSeverity {
        switch (severity) {
            case 'error':
                return DiagnosticSeverity.Error;
            case 'warning':
                return DiagnosticSeverity.Warning;
            case 'info':
                return DiagnosticSeverity.Information;
        }
    }

    /**
     * @param input
     */
    public toDiagnostics(input: Diagnostics) {
        return input.getMessages().map(message => {

            const span = message.span;
            const source = span
                ? input.getSource(span.getFilename())
                : null;

            const start = source && span
                ? source.positionAt(span.getStart())
                : { line: 1, column: 1 };
            const end = source && span
                ? source.positionAt(span.getEnd())
                : { line: 1, column: 1 };

            return {
                code: MessageCode[message.code],
                severity: this.toDiagnosticSeverity(message.severity),
                message: message.message,
                range: {
                    start: {
                        line: start.line - 1,
                        character: start.column - 1,
                    },
                    end: {
                        line: end.line - 1,
                        character: end.column - 1,
                    }
                }
            };
        });
    }
}