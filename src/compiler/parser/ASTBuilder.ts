import IdAllocator from '../../core/allocators/IdAllocator';
import AST from '@/compiler/parser/AST';
import Node from '@/compiler/parser/Node';

export default class ASTBuilder {
    /**
     * @private
     */
    private idAlloc: IdAllocator;

    /**
     * @private
     */
    private scope: Node;

    /**
     * The Abstract Syntax Tree (AST) currently being build (output)
     * @private
     */
    private ast: AST;

    /**
     * @param ast
     * @param idAlloc
     */
    constructor(ast: AST, idAlloc: IdAllocator) {
        this.scope = ast;
        this.ast = ast;

        this.idAlloc = idAlloc;
    }

    /**
     * @param name
     * @param value
     */
    public setAttribute(name: string, value: string | Node) {
        this.scope.setAttribute(name, value);
    }

    /**
     * @param name
     */
    public setAttributeFromLastChild(name: string) {
        const value = this.getLastNode();

        if (value) {
            this.scope.removeLastChild();
            this.setAttribute(name, value);
        }
    }

    /**
     * Get the last inserted Node
     */
    public getLastNode(): Node {
        return this.scope.getChildren()[this.scope.getChildren().length-1];
    }

    /**
     * Set the current scope
     * @param node
     */
    public setScope(node: Node) {
        this.scope = node;
    }

    /**
     * Move down
     */
    public down() {
        this.setLastNodeAsScope();
    }

    /**
     * Move up
     */
    public up() {
        const parent = this.getScope().getParent();

        if (! parent) {
            return;
        }

        this.setScope(parent);
    }

    /**
     * Get the current scope
     */
    public getScope() {
        return this.scope;
    }

    public setLastNodeAsScope() {
        this.setScope(this.getLastNode());
    }

    /**
     * Insert a Node into the current scope
     * @param node
     */
    public insert(node: Node) {
        node.setId(this.idAlloc.allocate());
        node.setParent(this.scope);
        this.scope.addChild(node);
    }

    public getAst() {
        return this.ast;
    }
}