import { Nullable } from '../types/nullable';
import { AttributeValue } from '../types/attribute';
import Parser from './Parser';
import Symbol from '../context/Symbol';
import Compiler from '../compiler/Compiler';
import Binder from '../context/Binder';
import TypeResolver from '../analyzer/TypeResolver';
import TypeChecker from '../analyzer/TypeChecker';
import TypeTable from '../analyzer/TypeTable';

export default class Node {

    /**
     * @protected
     */
    private id: Nullable<number> = null;

    /**
     * @private
     */
    private symbol: Nullable<Symbol> = null;

    /**
     *
     * @protected
     */
    protected value: string;

    /**
     *
     * @protected
     */
    protected parent: Nullable<Node> = null;

    /**
     *
     * @protected
     */
    protected children: Node[] = [];

    /**
     *
     * @protected
     */
    protected attributes: Record<string, AttributeValue> = {};

    /**
     *
     * @param value
     */
    constructor(value: string = '') {
        this.value = value;
    }

    /**
     * @param id
     */
    setId(id: number) {
        this.id = id;
    }

    /**
     *
     */
    getId(): Nullable<number> {
        return this.id;
    }

    /**
     * @param symbol
     */
    setSymbol(symbol: Symbol) {
        this.symbol = symbol;
    }

    /**
     *
     */
    getSymbol() {
        return this.symbol;
    }

    /**
     *
     */
    getName(): string {
        return this.constructor.name;
    }

    /**
     *
     * @param node
     */
    setParent(node: Node) {
        this.parent = node;
    }

    /**
     *
     */
    getParent(): Node {
        return this.parent;
    }

    /**
     *
     */
    getValue(): string {
        return this.value;
    }

    /**
     *
     * @param value
     */
    setValue(value: string) {
        this.value = value;
    }

    /**
     *
     * @param node
     */
    addChild(node: Node) {
        this.children.push(node);
    }

    /**
     *
     */
    getChildren() {
        return this.children;
    }

    /**
     *
     */
    hasChildren() {
        return (this.children.length > 0);
    }

    /**
     *
     * @param name
     * @param value
     */
    setAttribute(name: string, value: AttributeValue) {
        this.attributes[name] = value;
    }

    /**
     *
     * @param name
     */
    getAttribute(name: string): Nullable<AttributeValue> {
        return this.attributes[name] || null;
    }

    /**
     *
     */
    getAttributes(): Record<string, AttributeValue> {
        return this.attributes;
    }

    /**
     *
     */
    removeLastChild() {
        this.children.pop();
    }

    /**
     *
     * @param _parser
     */
    parse(_parser: Parser): boolean {
        return false;
    }

    /**
     *
     * @param _compiler
     */
    compile(compiler: Compiler) {
        // todo
    }

    bind(binder: Binder) {
        this.getChildren().forEach(child => {
            child.bind(binder);
        });
    }

    resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }

    check(typeChecker: TypeChecker, typeTable: TypeTable) {
        this.getChildren().forEach(child => {
            child.check(typeChecker, typeTable);
        });
    }

    print(): string {

        const printNode = (node: Node, indentAmount: number = 0): string => {

            const nodeName = `${node.getId()} – ${node.getName()}`;
            const nodeValue = node.getValue();

            const attributes = node.getAttributes();
            const attributesString = [];
            for (const attribute in attributes) {
                let attrValue = attributes[attribute];
                if (attrValue instanceof Node) {
                    const attrNodeValue = attrValue.getValue();
                    attrValue = `${attrValue.getName()}${attrNodeValue ? `(${attrNodeValue})` : ''}`;
                }
                attributesString.push(`${attribute}=${attrValue}`);
            }

            const tabs = indentAmount > 0 ? '   '.repeat(indentAmount - 1) + '└──' : '';
            const output = [`${tabs}${nodeName}${nodeValue ? `(${nodeValue})` : ''} ${attributesString.join(' ')}`];

            node.getChildren().forEach(childNode => {
                output.push(printNode(childNode, indentAmount + 1));
            });

            return output.join('\n');
        };

        return printNode(this);
    }
}