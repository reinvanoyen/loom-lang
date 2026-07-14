import { Nullable } from './types/nullable';
import { AttributeValue } from './types/attribute';
import Symbol from './Symbol';
import TypeResolver from './TypeResolver';
import TypeChecker from './TypeChecker';
import TypeTable from './TypeTable';
import chalk from 'chalk';

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
    protected value: Nullable<string> = null;

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
    constructor(value: Nullable<string> = null) {
        this.value = value;
    }

    /**
     * @param id
     */
    public setId(id: number) {
        this.id = id;
    }

    /**
     *
     */
    public getId(): Nullable<number> {
        return this.id;
    }

    /**
     * @param symbol
     */
    public setSymbol(symbol: Symbol) {
        this.symbol = symbol;
    }

    /**
     *
     */
    public getSymbol() {
        return this.symbol;
    }

    /**
     *
     */
    public getName(): string {
        return this.constructor.name;
    }

    /**
     *
     * @param node
     */
    public setParent(node: Node) {
        this.parent = node;
    }

    /**
     *
     */
    public getParent(): Nullable<Node> {
        return this.parent;
    }

    /**
     *
     */
    public getValue(): Nullable<string> {
        return this.value;
    }

    /**
     *
     * @param node
     */
    public addChild(node: Node) {
        this.children.push(node);
    }

    /**
     *
     */
    public getChildren() {
        return this.children;
    }

    /**
     *
     */
    public hasChildren() {
        return (this.children.length > 0);
    }

    /**
     *
     * @param name
     * @param value
     */
    public setAttribute(name: string, value: AttributeValue) {
        this.attributes[name] = value;
    }

    /**
     *
     * @param name
     */
    public getAttribute(name: string): Nullable<AttributeValue> {
        return this.attributes[name] || null;
    }

    /**
     * @param name
     */
    public getStringAttribute(name: string): Nullable<string> {
        const value = this.getAttribute(name);
        if (typeof value === 'string') {
            return value;
        }
        
        return null;
    }

    /**
     *
     */
    public getAttributes(): Record<string, AttributeValue> {
        return this.attributes;
    }

    /**
     *
     */
    public removeLastChild() {
        this.children.pop();
    }

    public resolve(typeResolver: TypeResolver) {
        this.getChildren().forEach(child => {
            child.resolve(typeResolver);
        });
    }

    public check(typeChecker: TypeChecker, typeTable: TypeTable) {
        this.getChildren().forEach(child => {
            child.check(typeChecker, typeTable);
        });
    }

    public print() {

        const printNode = (node: Node, indentAmount: number = 0): string => {

            const nodeId = node.getId();
            const nodeName = `${chalk.yellow(node.getName())}`;
            const nodeValue = node.getValue();
            const nodeSymbol = node.getSymbol();

            const formattedNodeId = chalk.green((nodeId ? `${nodeId}` : '-').padEnd(4));
            const formattednodeSymbol = chalk.grey((nodeSymbol ? `${nodeSymbol.getId()}` : 'unbnd').padEnd(6));

            const attributes = node.getAttributes();
            const attributesString = [];
            for (const attribute in attributes) {
                let attrValue = attributes[attribute];
                if (attrValue instanceof Node) {
                    const attrNodeValue = attrValue.getValue();
                    attrValue = `${attrValue.getName()}${attrNodeValue ? `(${chalk.red(attrNodeValue)})` : ''}`;
                }
                attributesString.push(`${chalk.magenta(attribute)}=${chalk.cyan(attrValue)}`);
            }

            const tabs = indentAmount > 0 ? '   '.repeat(indentAmount - 1) + '└──' : '';
            const output = [`${formattedNodeId} ${formattednodeSymbol} ${chalk.grey(tabs)}${nodeName}${nodeValue ? `(${chalk.red(nodeValue)})` : ''} ${attributesString.join(' ')}`];

            node.getChildren().forEach(childNode => {
                output.push(printNode(childNode, indentAmount + 1));
            });

            return output.join('\n');
        };

        const output = printNode(this);

        console.log(output);
    }
}