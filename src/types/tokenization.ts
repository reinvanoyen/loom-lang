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
    line?: number;
    position?: number;
    startPosition?: Position;
    endPosition?: Position;
}

export type Position = {
    index: number;
    line: number;
    column: number;
};