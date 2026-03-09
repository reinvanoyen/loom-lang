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
    span?: Span;
};

export default class DiagReporter {
    /**
     * @private
     */
    private readonly source: Source;

    /**
     * @param source
     */
    constructor(source: Source) {
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
     * @param span
     * @private
     */
    private sourceSnippet(span: Span): SourceSnippet {

        const snippet = this.source.slice(span.getStart(), span.getEnd());

        return {
            snippet,
            caretLine: chalk.red('^'+'~'.repeat(snippet.length-1))
        };
    }

    public print() {

        this.messages.forEach(message => {

            const formatted = `${MessageCode[message.code]}: ${message.message} ${message.span ? this.source.formatSpan(message.span) : ''}`;

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
                const { snippet, caretLine } = this.sourceSnippet(message.span);
                console.log(snippet);
                console.log(caretLine);
            }
        });
    }
}