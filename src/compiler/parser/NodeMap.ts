import Node from './Node';

export default class NodeMap {
    /**
     * @private
     */
    private nodes: Map<number, Node>;

    /**
     *
     */
    constructor() {
        this.nodes = new Map();
    }

    /**
     * @param node
     */
    add(node: Node) {
        const id = node.getId();

        if (! id) {
            // todo - improve error?
            throw new Error('Node has no id');
        }

        this.nodes.set(id, node)
        return node
    }

    /**
     * @param id
     */
    get(id: number) {
        return this.nodes.get(id)
    }
}