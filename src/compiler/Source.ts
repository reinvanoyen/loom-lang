import Span from '@/core/Span';

export default class Source {
    /**
     * @private
     */
    private readonly text: string;

    /**
     * @private
     */
    private readonly lineStarts: number[];

    /**
     *
     * @param text
     */
    constructor(text: string) {
        this.text = text;
        this.lineStarts = this.computeLineStarts(this.text);
    }

    public getText(): string {
        return this.text;
    }

    public getLength(): number {
        return this.text.length;
    }

    /**
     * @param i
     */
    public getCharAt(i: number): string {
        return this.text[i] ?? '';
    }

    /**
     * @param i
     */
    public getCharCodeAt(i: number): number {
        return i < 0 || i >= this.text.length ? -1 : this.text.charCodeAt(i);
    }

    /**
     *
     * @param offset
     */
    public positionAt(offset: number): { line: number; column: number } {
        // Clamp so callers can be sloppy.
        offset = Math.max(0, Math.min(offset, this.text.length));

        // Binary search: find rightmost lineStart <= offset.
        const starts = this.lineStarts;
        let lo = 0, hi = starts.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >>> 1;
            const s = starts[mid];
            if (s === offset) return { line: mid, column: 0 };
            if (s < offset) lo = mid + 1;
            else hi = mid - 1;
        }
        const line = Math.max(0, hi);
        return { line, column: offset - starts[line] };
    }

    public formatSpan(span: Span): string {
        return 'span';
    }

    /**
     * @param start
     * @param end
     */
    public slice(start: number, end: number): string {
        return this.text.slice(start, end);
    }

    /**
     * @param text
     * @private
     */
    private computeLineStarts(text: string): number[] {
        const starts: number[] = [0];

        // Note: JS string indices are UTF-16 code units. That's fine if we
        // use the same unit everywhere (lexer/parser spans too).
        for (let i = 0; i < text.length; i++) {
            const ch = text.charCodeAt(i);

            if (ch === 0x0d /* \r */) {
                // \r\n counts as one newline.
                if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x0a /* \n */) {
                    i++; // consume \n as part of \r\n
                }
                starts.push(i + 1);
                continue;
            }

            if (ch === 0x0a /* \n */) {
                starts.push(i + 1);
                continue;
            }
        }

        return starts;
    }

    /**
     * @param span
     */
    public snippet(span: Span): string {
        return '';
    }
}