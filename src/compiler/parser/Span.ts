export default class Span {
    /**
     * @private
     */
    private filename: string;

    /**
     * @private
     */
    private startLine: number;

    /**
     * @private
     */
    private startCol: number;

    /**
     * @private
     */
    private endLine: number;

    /**
     * @private
     */
    private endCol: number;

    /**
     * @param filename
     * @param startLine
     * @param startCol
     * @param endLine
     * @param endCol
     */
    constructor(filename: string, startLine: number, startCol: number, endLine: number, endCol: number) {
        this.filename = filename;
        this.startLine = startLine;
        this.startCol = startCol;
        this.endLine = endLine;
        this.endCol = endCol;
    }
}