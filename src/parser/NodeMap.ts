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
        this.nodes.set(node.getId(), node)
        return node
    }

    /**
     * @param id
     */
    get(id: number) {
        return this.nodes.get(id)
    }
}