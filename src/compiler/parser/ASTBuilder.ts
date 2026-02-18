import IdAllocator from '../../core/allocators/IdAllocator';

export default class ASTBuilder {

    /**
     * @private
     */
    private id: IdAllocator;

    /**
     * @param id
     */
    constructor(id: IdAllocator) {
        this.id = id;
    }
}