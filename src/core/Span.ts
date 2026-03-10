import { Position } from '../compiler/types/tokenization';

export default class Span {
    /**
     * @private
     */
    private filename: string;

    /**
     * @private
     */
    private start: Position;

    /**
     * @private
     */
    private end: Position;

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

    public getStart(): number {
        return this.start;
    }

    public getEnd(): number {
        return this.end;
    }
}