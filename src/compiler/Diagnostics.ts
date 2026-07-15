import Source from '@/compiler/Source';
import chalk from 'chalk';
import Span from '@/core/Span';

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

    E_IMPORT_NOT_FOUND,
    E_IMPORT_CYCLE,
}

type SourceSnippet = {
    snippet: string;
    caretLine: string; // caret pointing at index (best effort)
};

type MessageSeverity = 'info' | 'warning' | 'error';

type DiagnosticMessage = {
    severity: MessageSeverity;
    code: MessageCode,
    message: string;
    nodeId?: number;
    span?: Span;
};

export default class Diagnostics {

    private sources = new Map<string, Source>();

    /**
     * @param source
     */
    public registerSource(source: Source) {
        this.sources.set(source.getFilename(), source);
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
     * @param span
     * @private
     */
    private sourceSnippet(span: Span): SourceSnippet {

        const source = this.sources.get(span.getFilename());

        if (! source) {
            return { snippet: '', caretLine: '' };
        }

        const snippet = source.slice(span.getStart(), span.getEnd());

        return {
            snippet,
            caretLine: chalk.red('^'+'~'.repeat(Math.max(0, snippet.length - 1)))
        };
    }

    public print() {

        this.messages.forEach(message => {

            const filename = message.span?.getFilename() || '';
            const source = this.sources.get(filename);

            if (! source) {
                console.log(this.createMessage(message.message, message.severity));
                return;
            }

            const location = message.span ? source.formatLocation(message.span) : 'unknown location';
            const formatted = `${MessageCode[message.code]}: ${message.message} ${message.span ? source.formatSpan(message.span) : ''}`;

            console.log(`${location}: ${this.createMessage(formatted, message.severity)}`);

            if (message.span) {
                const { snippet, caretLine } = this.sourceSnippet(message.span);
                console.log(snippet);
                console.log(caretLine);
            }
        });
    }

    /**
     * @param message
     * @param severity
     * @private
     */
    private createMessage(message: string, severity: MessageSeverity) {
        if (severity === 'error') {
            return chalk.red(`${message}`);
        }

        if (severity === 'warning') {
            return chalk.yellow(`${message}`);
        }

        if (severity === 'info') {
            return chalk.grey(`${message}`);
        }
    }
}