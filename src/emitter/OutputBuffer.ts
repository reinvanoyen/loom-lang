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
    write(string: string) {
        this.body.push(string);
    }

    /**
     *
     * @param string
     */
    prepend(string: string) {
        this.head.push(string);
    }

    /**
     *
     * @param string
     */
    append(string: string) {
        this.foot.push(string);
    }

    /**
     *
     */
    render(): string {
        return this.head.join('')+this.body.join('')+this.foot.join('');
    }
}