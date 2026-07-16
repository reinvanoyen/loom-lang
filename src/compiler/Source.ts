import Span from '@/core/Span';

export default class Source {
    private readonly text: string;
    private readonly filename: string;
    private readonly lineStarts: number[];

    constructor(text: string, filename: string) {
        this.text = text;
        this.lineStarts = this.computeLineStarts(text);
        this.filename = filename;
    }

    public getFilename(): string {
        return this.filename;
    }

    public getText(): string {
        return this.text;
    }

    public getLength(): number {
        return this.text.length;
    }

    public getCharAt(i: number): string {
        return this.text[i] ?? '';
    }

    public getCharCodeAt(i: number): number {
        return i < 0 || i >= this.text.length ? -1 : this.text.charCodeAt(i);
    }

    public positionAt(offset: number): { line: number; column: number } {
        offset = Math.max(0, Math.min(offset, this.text.length));

        const starts = this.lineStarts;
        let lo = 0;
        let hi = starts.length - 1;

        while (lo <= hi) {
            const mid = (lo + hi) >>> 1;
            const s = starts[mid];

            if (s === offset) {
                return { line: mid + 1, column: 1 };
            }

            if (s < offset) lo = mid + 1;
            else hi = mid - 1;
        }

        const lineIndex = Math.max(0, hi);
        return {
            line: lineIndex + 1,
            column: offset - starts[lineIndex] + 1,
        };
    }

    public formatLocation(span: Span): string {
        const location = this.getFilename();
        const start = this.positionAt(span.getStart());

        const line = start.line;
        const position = start.column;

        return `${location}:${line}:${position}`;
    }

    public formatSpan(span: Span): string {
        const start = this.positionAt(span.getStart());
        const end = this.positionAt(span.getEnd());

        if (start.line === end.line) {
            return `(line ${start.line}, cols ${start.column}-${end.column})`;
        }

        return `(line ${start.line}:${start.column} to ${end.line}:${end.column})`;
    }

    public slice(start: number, end: number): string {
        return this.text.slice(start, end);
    }

    private computeLineStarts(text: string): number[] {
        const starts: number[] = [0];

        for (let i = 0; i < text.length; i++) {
            const ch = text.charCodeAt(i);

            if (ch === 0x0d /* \r */) {
                if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x0a /* \n */) {
                    i++;
                }
                starts.push(i + 1);
            } else if (ch === 0x0a /* \n */) {
                starts.push(i + 1);
            }
        }

        return starts;
    }
}