export default class IdAllocator {
    /**
     * @private
     */
    private id: number = 0;

    /**
     * Allocate a new id
     */
    public allocate(): number {
        this.id++;
        return this.id;
    }
}