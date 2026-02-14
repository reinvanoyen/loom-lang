export default class OutputBuffer {

    /**
     *
     * @private
     */
    private head: string[] = [];

    /**
     *
     * @private
     */
    private body: string[] = [];

    /**
     *
     * @private
     */
    private foot: string[] = [];

    /**
     *
     * @param string
     */
    writeBody(string: string) {
        this.body.push(string);
    }

    /**
     *
     * @param string
     */
    writeHead(string: string) {
        this.head.push(string);
    }

    /**
     *
     * @param string
     */
    writeFoot(string: string) {
        this.foot.push(string);
    }

    /**
     *
     */
    getHead(): string {
        return this.head.join('');
    }

    /**
     *
     */
    getBody(): string {
        return this.body.join('');
    }

    /**
     *
     */
    getFoot(): string {
        return this.foot.join('');
    }

    render(): string {
        return this.getHead()+this.getBody()+this.getFoot();
    }
}