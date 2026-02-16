export default {
    REGEX_IDENT: /\p{L}/u,
    REGEX_RAW_BLOCK_START: /{/,
    REGEX_RAW_BLOCK_END: /}/,
    REGEX_RAW_BLOCK_INSIDE: /%/,
    REGEX_NUMBER: /\d/,
    REGEX_SYMBOL: /[.!?,;:()\-+=%*\\/—–…${}><&#@°|]/,
    REGEX_WHITESPACE: /\s/,
    REGEX_NEWLINE: /[\n\r]/,
    REGEX_STRING_DELIMITER: /["']/,
    STRING_ESCAPE_SYMBOL: '\\',
};