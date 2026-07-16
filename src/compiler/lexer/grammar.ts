export default {
    REGEX_IDENT_START: /[\p{L}_]/u,
    REGEX_IDENT_CONT: /[\p{L}\p{N}\p{M}_]/u,
    REGEX_RAW_BLOCK_START: /{/,
    REGEX_RAW_BLOCK_END: /}/,
    REGEX_RAW_BLOCK_INSIDE: /%/,
    REGEX_NUMBER: /[0-9]/,
    REGEX_SYMBOL: /[.!?,;:()\-+=%*\\/—–…${}><&#@°|]/,
    REGEX_WHITESPACE: /[ \t\f\v\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
    REGEX_NEWLINE: /[\n\r]/,
    REGEX_STRING_DELIMITER: /["'`]/,
    STRING_ESCAPE_SYMBOL: '\\',
};