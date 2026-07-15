import AST from './AST';
import TypeTable from './TypeTable';
import Type from '@/compiler/nodes/Type';
import { ResolvedType } from './types/analyzer';
import IdentifierType from '@/compiler/nodes/IdentifierType';
import StringType from '@/compiler/nodes/StringType';
import Symbol from './Symbol';
import Diagnostics, { MessageCode } from './Diagnostics';
import { Nullable } from './types/nullable';
import EventBus from '../core/bus/EventBus';
import { TEventMap } from './types/bus';

type TypeChildNode = IdentifierType | StringType;

export default class TypeResolver {
    /**
     * @private
     */
    private events: EventBus<TEventMap>;

    /**
     * @private
     */
    private typeTable: TypeTable;

    /**
     * @private
     */
    private reporter: Diagnostics;

    /**
     * @param events
     * @param reporter
     * @param typeTable
     */
    constructor(events: EventBus<TEventMap>, reporter: Diagnostics, typeTable: TypeTable) {
        this.events = events;
        this.reporter = reporter;
        this.typeTable = typeTable;
    }

    /**
     *
     * @param symbol
     * @param type
     */
    defineType(symbol: Symbol, type: ResolvedType) {
        const symbolId = symbol.getId();

        if (! symbolId) {
            this.reporter.error({
                code: MessageCode.E_UNBOUND_SYMBOL,
                message: 'Symbol has no id'
            });
            return;
        }

        this.typeTable.registerType(symbolId, type);
        this.events.emit('typeDefine', { symbol, type });
    }

    /**
     * @param type
     */
    resolveType(type: Type): Nullable<ResolvedType> {

        const children = type.getChildren();

        if (children.length > 1) {
            return {
                kind: 'union',
                members: this.normalizeUnion(children as TypeChildNode[])
            }
        }

        if (children.length === 1) {
            return this.resolveTypeNodeChild(children[0] as TypeChildNode);
        }

        this.reporter.error({
            code: MessageCode.E_UNKNOWN,
            message: 'TypeResolver error, no types in type?',
        });

        return null;
    }

    /**
     * @param typeChild
     */
    private resolveTypeNodeChild(typeChild: TypeChildNode): Nullable<ResolvedType> {

        if (typeChild instanceof IdentifierType) {

            if (typeChild.getValue() === 'string') {
                return {
                    kind: 'primitive',
                    name: 'string'
                };
            }

            const symbol = typeChild.getSymbol();

            if (! symbol) {
                this.reporter.error({
                    code: MessageCode.E_UNBOUND_SYMBOL,
                    message: `Unbound type identifier '${typeChild.getValue()}'`,
                });
                return null;
            }

            const symbolId = symbol.getId();

            if (!symbolId) {
                console.log(symbol);
                this.reporter.error({
                    code: MessageCode.E_UNBOUND_SYMBOL,
                    message: 'Symbol has no id',
                });
                return null;
            }

            return { kind: 'ref', symbolId: symbolId };
        }

        if (typeChild instanceof StringType) {
            const value = typeChild.getValue();

            if (value === null) {
                this.reporter.error({
                    code: MessageCode.E_STRING_TYPE_VALUE,
                    message: 'String type has no value',
                });
                return null;
            }

            return { kind: 'literal', value };
        }

        this.reporter.error({
            code: MessageCode.E_UNKNOWN,
            message: 'Unknown type node',
        });

        return null;
    }

    /**
     * @param nodes
     * @private
     */
    private normalizeUnion(nodes: TypeChildNode[]): ResolvedType[] {
        const resolvedTypes: ResolvedType[] = [];

        nodes.forEach(node => {
            const resolvedType = this.resolveTypeNodeChild(node);

            if (resolvedType) {
                resolvedTypes.push(resolvedType);
            }
        });

        return resolvedTypes;
    }

    /**
     * @param ast
     */
    resolve(ast: AST) {
        this.events.emit('startTypeResolving', { ast });
        ast.resolve(this);
    }
}