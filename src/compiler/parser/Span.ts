import { Position } from '../types/tokenization';

export default class Span {
    /**
     * @private
     */
    private filename: string;

    /**
     * @private
     */
    private startPosition: Position;

    /**
     * @private
     */
    private endPosition: Position;

    /**
     * @param filename
     * @param startPosition
     * @param endPosition
     */
    constructor(filename: string, startPosition: Position, endPosition: Position) {
        this.filename = filename;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }
}