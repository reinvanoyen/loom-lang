import { Position } from '@/compiler/types/tokenization';

export default class Span {

    /**
     * The filename of the span
     * @private
     */
    private readonly filename: string;

    /**
     * The start position of the span
     * @private
     */
    private readonly start: Position;

    /**
     * The end position of the span
     * @private
     */
    private readonly end: Position;

    /**
     *
     * @param filename
     * @param start
     * @param end
     */
    constructor(filename: string, start: Position, end: Position) {
        this.filename = filename;
        this.start = start;
        this.end = end;
    }

    /**
     * Gets the filename of the span
     */
    public getFilename(): string {
        return this.filename;
    }

    /**
     * Gets the start position of the span
     */
    public getStart(): number {
        return this.start;
    }

    /**
     * Gets the end position of the span
     */
    public getEnd(): number {
        return this.end;
    }
}