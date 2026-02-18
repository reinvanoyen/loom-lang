import Symbol from '../binder/Symbol';
import { ResolvedType } from './analyzer';
import AST from '../parser/AST';
import TypeTable from '../analyzer/TypeTable';
import TokenStream from '../tokenization/TokenStream';

export interface TEventMap {
    startTokenization: { code: string }
    startParsing: { tokenStream: TokenStream }
    startTypeResolving: { ast: AST }
    startTypeChecking: { ast: AST, typeTable: TypeTable }
    symbolBind: { name: string, symbol: Symbol }
    typeDefine: { symbol: Symbol, type: ResolvedType }
}

export type TEventKey<E> = keyof E;

export type TEventListener<E, K extends TEventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;