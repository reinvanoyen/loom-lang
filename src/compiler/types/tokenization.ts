import Span from '@/core/Span';

export enum LexMode {
    ALL,
    UNKNOWN,
    IDENT,
    NUMBER,
    SYMBOL,
    WHITESPACE,
    NEWLINE,
    STRING,
    RAW_BLOCK,
}

export enum TokenType {
    UNKNOWN = 'Unknown',
    IDENT = 'Ident',
    NUMBER = 'Number',
    SYMBOL = 'Symbol',
    NEWLINE = 'Newline',
    STRING = 'String',
    RAW_BLOCK = 'RawBlock'
}

export type Token = {
    value: string;
    type: TokenType;
    span: Span;
}

export type Position = number;