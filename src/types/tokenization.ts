export enum LexMode {
    ALL,
    UNKNOWN,
    IDENT,
    NUMBER,
    SYMBOL,
    WHITESPACE,
    NEWLINE,
    STRING,
    VAR,
    COLOR,
    COMMENT
}

export enum TokenType {
    UNKNOWN = 'Unknown',
    IDENT = 'Ident',
    NUMBER = 'Number',
    SYMBOL = 'Symbol',
    NEWLINE = 'Newline',
    STRING = 'String',
    VAR = 'Var',
    COLOR = 'Color'
}

export type Token = {
    value: string;
    type: TokenType;
    line: number;
    position: number;
    end: boolean;
}

export type TokenStream = Token[];