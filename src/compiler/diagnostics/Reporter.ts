import { Position } from '../types/tokenization';

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
     *
     */
    public hasErrors(): boolean {
        const errors = this.messages.filter(message => {
            return message.severity === 'error';
        });

        return errors.length > 0;
    }

    public print() {
        console.table(this.messages);
    }
}