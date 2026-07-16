import Symbol from '../binder/Symbol';
import { ResolvedType } from './analyzer';
import AST from '../parser/AST';
import TypeTable from '../type-safety/TypeTable';
import TokenStream from '../lexer/TokenStream';

export interface EventMap {
    startTokenization: { code: string }
    startParsing: { tokenStream: TokenStream }
    endParsing: { tokenStream: TokenStream }
    startTypeResolving: { ast: AST }
    startTypeChecking: { ast: AST, typeTable: TypeTable }
    symbolBind: { name: string, symbol: Symbol }
    typeDefine: { symbol: Symbol, type: ResolvedType }
}

export type EventKey<E> = keyof E;

export type EventListener<E, K extends EventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;