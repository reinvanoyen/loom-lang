import { Position } from './types/tokenization';
import chalk from 'chalk';

export enum MessageCode {

    E_UNKNOWN,

    E_TOKEN_NOT_CLOSED,
    E_UNEXPECTED_TOKEN,

    E_MISSING_TYPE,

    E_DUPLICATE_SYMBOL,
    E_UNDEFINED_SYMBOL,
    E_UNBOUND_SYMBOL,

    E_STRING_TYPE_VALUE,

    E_SLOT_INVALID_CONTEXT,
    E_SLOT_AUGMENT_FORBIDDEN,
    E_SLOT_DUPLICATE,
    E_SLOT_UNKNOWN,
}

type SourceSnippet = {
    snippet: string;
    caretLine: string; // caret pointing at index (best effort)
};

type DiagnosticMessage = {
    severity: 'info' | 'warning' | 'error';
    code: MessageCode,
    message: string;
    nodeId?: number;
    span?: { start: Position, end: Position };
};

export default class DiagReporter {
    /**
     * @private
     */
    private source: string;

    /**
     * @param source
     */
    constructor(source: string) {
        this.source = source;
    }

    /**
     * @private
     */
    private messages: DiagnosticMessage[] = [];

    /**
     * @param message
     */
    public report(message: DiagnosticMessage) {
        this.messages.push(message);
    }

    /**
     * @param message
     */
    public error(message: Omit<DiagnosticMessage, 'severity'>) {
        this.report({
            severity: 'error',
            ...message
        });
    }

    /**
     *
     */
    public hasErrors(): boolean {
        const errors = this.messages.filter(message => {
            return message.severity === 'error';
        });

        return errors.length > 0;
    }

    /**
     * Return a small snippet around an absolute string index.
     * - Uses code-unit indices (normal JS string indexing).
     * - Expands tabs in the printed snippet so the caret lines up (configurable).
     */
    private sourceSnippet(source: string, span: { start: Position, end: Position }): SourceSnippet {
        const line = span.start.line;
        const column = span.start.column-1;
        const lines = source.split('\n');
        const lineNumber = `${column}: `;

        return { snippet: `${lineNumber}${lines[line - 1] || ''}`, caretLine: ' '.repeat(lineNumber.length)+' '.repeat(column)+'^' };
    }

    public print() {
        this.messages.forEach(message => {

            const startPos = `${message.span?.start.line}:${message.span?.start.column}`;
            const endPos = `${message.span?.end.line}:${message.span?.end.column}`;
            const formatted = `${MessageCode[message.code]}: ${message.message} ${startPos} -> ${endPos}`;

            if (message.severity === 'error') {
                console.log(chalk.red(`${formatted}`));
            }

            if (message.severity === 'warning') {
                console.log(chalk.yellow(`${formatted}`));
            }

            if (message.severity === 'info') {
                console.log(chalk.grey(`${formatted}`));
            }

            if (message.span) {
                const { snippet, caretLine } = this.sourceSnippet(this.source, message.span);
                console.log(snippet);
                console.log(caretLine);
            }
        });
    }
}