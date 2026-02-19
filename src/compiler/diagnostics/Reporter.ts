import { Position } from '../types/tokenization';
import chalk from 'chalk';

type DiagnosticMessage = {
    severity: 'info' | 'warning' | 'error';
    message: string;
    nodeId?: number;
    span?: { start: Position, end: Position };
};

export default class Reporter {
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

    public print() {
        this.messages.forEach(message => {
            const startPos = `${message.span?.start.line}:${message.span?.start.column}`;
            const endPos = `${message.span?.end.line}:${message.span?.end.column}`;
            const formatted = `${message.message} ${startPos} -> ${endPos}`;

            if (message.severity === 'error') {
                console.log(chalk.red(`E ${formatted}`));
            }

            if (message.severity === 'warning') {
                console.log(chalk.yellow(`W ${formatted}`));
            }


            if (message.severity === 'info') {
                console.log(chalk.grey(`I ${formatted}`));
            }
        });
    }
}