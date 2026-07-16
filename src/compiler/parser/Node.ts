import { Nullable } from '../types/nullable';
import { AttributeValue } from '../types/attribute';
import Symbol from '../binder/Symbol';
import TypeResolver from '../type-safety/TypeResolver';
import TypeChecker from '../type-safety/TypeChecker';
import TypeTable from '../type-safety/TypeTable';
import chalk from 'chalk';
import { symbolMapToString } from '@/compiler/helpers';

export default class Node {
    /**
     * @protected
     */
    private id: Nullable<number> = null;

    /**
     * @private
     */
    private symbols: Map<string, Symbol> = new Map();

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
     * @param name
     */
    public setSymbol(symbol: Symbol, name: string = 'self') {
        this.symbols.set(name, symbol);
    }

    /**
     * @param name
     */
    public getSymbol(name: string = 'self') {
        return this.symbols.get(name);
    }

    /**
     *
     */
    public getSymbols() {
        return this.symbols;
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

    public print(): void {
        const lines: string[] = [];

        const hasValue = (value: unknown): boolean =>
            value !== undefined && value !== null && value !== '';

        const formatValue = (value: unknown): string => {
            if (typeof value === 'string') {
                return chalk.red(JSON.stringify(value));
            }

            if (typeof value === 'number' || typeof value === 'bigint') {
                return chalk.yellow(String(value));
            }

            if (typeof value === 'boolean') {
                return chalk.blue(String(value));
            }

            if (value === null) {
                return chalk.dim('null');
            }

            if (value === undefined) {
                return chalk.dim('undefined');
            }

            return chalk.cyan(String(value));
        };

        const formatAttributeValue = (value: unknown): string => {
            if (value instanceof Node) {
                const nodeValue = value.getValue();

                return [
                    chalk.yellow(value.getName()),
                    hasValue(nodeValue) ? `(${formatValue(nodeValue)})` : '',
                    chalk.dim(`#${value.getId() ?? '-'}`),
                ].join('');
            }

            if (Array.isArray(value)) {
                return `[${value.map(formatAttributeValue).join(', ')}]`;
            }

            if (typeof value === 'object' && value !== null) {
                return chalk.cyan(JSON.stringify(value));
            }

            return formatValue(value);
        };

        const formatAttributes = (node: Node): string[] => {
            return Object.entries(node.getAttributes()).map(([name, value]) => {
                return `${chalk.magenta(name)}=${formatAttributeValue(value)}`;
            });
        };

        const printNode = (
            node: Node,
            prefix = '',
            isLast = true,
            isRoot = false,
        ): void => {
            const connector = isRoot
                ? ''
                : isLast
                    ? chalk.dim('└─ ')
                    : chalk.dim('├─ ');

            const nodeId = chalk.dim(`#${node.getId() ?? '-'}`);
            const nodeName = chalk.bold.yellow(node.getName());
            const nodeValue = node.getValue();
            const symbols = symbolMapToString(node.getSymbols());

            const header = [
                `${prefix}${connector}${nodeName}`,
                hasValue(nodeValue) ? ` ${formatValue(nodeValue)}` : '',
                ` ${nodeId}`,
                symbols ? ` ${chalk.dim(`[${symbols}]`)}` : '',
            ].join('');

            lines.push(header);

            const childPrefix = isRoot
                ? ''
                : `${prefix}${isLast ? '   ' : '│  '}`;

            const attributes = formatAttributes(node);

            attributes.forEach((attribute, index) => {
                const isLastAttribute =
                    index === attributes.length - 1 &&
                    node.getChildren().length === 0;

                lines.push(
                    `${childPrefix}${isLastAttribute ? '└─ ' : '├─ '}` +
                    `${chalk.dim('@')} ${attribute}`,
                );
            });

            const children = node.getChildren();

            children.forEach((child, index) => {
                printNode(
                    child,
                    childPrefix,
                    index === children.length - 1,
                    false,
                );
            });
        };

        printNode(this, '', true, true);

        console.log(lines.join('\n'));
    }
}