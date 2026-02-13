// src/tokenization/grammar.ts
var grammar_default = {
  REGEX_IDENT: /\p{L}/u,
  REGEX_NUMBER: /\d/,
  REGEX_SYMBOL: /[.!?,;:()\-+=%*\\/—–…${}><&#@°|]/,
  REGEX_WHITESPACE: /\s/,
  REGEX_NEWLINE: /[\n\r]/,
  REGEX_STRING_DELIMITER: /["']/
};

// src/tokenization/Lexer.ts
var Lexer = class {
  constructor() {
    /**
     * The current mode of lexing
     * @private
     */
    this.mode = 0 /* ALL */;
    /**
     * The current position of the cursor
     * @private
     */
    this.cursor = 0;
    /**
     * The position of the cursor at the start of the mode
     * @private
     */
    this.modeStartCursor = 0;
    /**
     * The current line, starting at line 1
     * @private
     */
    this.line = 1;
    /**
     * The current position on the current line, starting at 1
     * @private
     */
    this.column = 1;
    /**
     * The current character
     * @private
     */
    this.character = "";
    /**
     * The next character, handy for simple look-ahead
     * @private
     */
    this.nextCharacter = "";
    /**
     * The index of the last character, also the amount of characters
     * @private
     */
    this.end = 0;
    /**
     * The current token stream being created
     * @private
     */
    this.tokens = [];
    /**
     * The current value being lexed
     * @private
     */
    this.value = "";
    /**
     * The current delimiter (e.g. string delimiter or boundary)
     * @private
     */
    this.delimiter = "";
  }
  /**
   * Transforms code into a TokenStream
   * @param text
   */
  tokenize(text) {
    this.source = text;
    this.end = this.source.length;
    while (this.cursor < this.end) {
      this.character = this.source[this.cursor];
      this.nextCharacter = this.source[this.cursor + 1] || null;
      if (this.mode === 0 /* ALL */) {
        this.mode = this.determineMode();
        this.modeStartCursor = this.cursor;
      }
      switch (this.mode) {
        case 2 /* IDENT */:
          this.lexIdent();
          break;
        case 3 /* NUMBER */:
          this.lexNumber();
          break;
        case 4 /* SYMBOL */:
          this.lexSymbol();
          break;
        case 6 /* NEWLINE */:
          this.lexNewline();
          break;
        case 5 /* WHITESPACE */:
          this.lexWhitespace();
          break;
        case 1 /* UNKNOWN */:
          this.lexUnknown();
          break;
      }
    }
    return this.tokens;
  }
  /**
   * @private
   */
  atEnd(accountForDelimiter = false) {
    const offset = accountForDelimiter ? 1 : 0;
    return this.cursor + offset >= this.end;
  }
  /**
   * Determines the lexing mode based on the current character
   * @private
   */
  determineMode() {
    this.value = "";
    if (grammar_default.REGEX_IDENT.exec(this.character)) {
      return 2 /* IDENT */;
    }
    if (grammar_default.REGEX_STRING_DELIMITER.exec(this.character)) {
      this.delimiter = this.character;
      return 7 /* STRING */;
    }
    if (grammar_default.REGEX_NUMBER.exec(this.character)) {
      return 3 /* NUMBER */;
    }
    if (grammar_default.REGEX_SYMBOL.exec(this.character)) {
      return 4 /* SYMBOL */;
    }
    if (grammar_default.REGEX_NEWLINE.exec(this.character)) {
      return 6 /* NEWLINE */;
    }
    if (grammar_default.REGEX_WHITESPACE.exec(this.character)) {
      return 5 /* WHITESPACE */;
    }
    return 1 /* UNKNOWN */;
  }
  /**
   * Tokenize identifier
   * @private
   */
  lexIdent() {
    this.value += this.character;
    this.cursor++;
    if (!this.nextCharacter || !grammar_default.REGEX_IDENT.exec(this.nextCharacter)) {
      this.tokens.push({
        type: "Ident" /* IDENT */,
        value: this.value,
        line: this.line,
        position: this.column,
        end: this.atEnd()
      });
      this.column += this.value.length;
      this.mode = 0 /* ALL */;
    }
  }
  /**
   * Tokenize number
   * @private
   */
  lexNumber() {
    this.value += this.character;
    this.cursor++;
    if (!this.nextCharacter || !grammar_default.REGEX_NUMBER.exec(this.nextCharacter)) {
      this.tokens.push({
        type: "Number" /* NUMBER */,
        value: this.value,
        line: this.line,
        position: this.column,
        end: this.atEnd()
      });
      this.column += this.cursor - this.modeStartCursor;
      this.mode = 0 /* ALL */;
    }
  }
  /**
   * Tokenize symbol
   * @private
   */
  lexSymbol() {
    this.cursor++;
    this.tokens.push({
      type: "Symbol" /* SYMBOL */,
      value: this.character,
      line: this.line,
      position: this.column,
      end: this.atEnd()
    });
    this.column++;
    this.mode = 0 /* ALL */;
  }
  /**
   * Tokenize newline
   * @private
   */
  lexNewline() {
    this.cursor++;
    this.line++;
    this.column = 1;
    this.mode = 0 /* ALL */;
  }
  /**
   * Tokenize whitespace
   * @private
   */
  lexWhitespace() {
    this.cursor++;
    this.column++;
    this.mode = 0 /* ALL */;
  }
  /**
   * Tokenize unknown
   * @private
   */
  lexUnknown() {
    this.tokens.push({
      type: "Unknown" /* UNKNOWN */,
      value: this.character,
      line: this.line,
      position: this.column,
      end: this.atEnd()
    });
    this.cursor++;
    this.column++;
    this.mode = 0 /* ALL */;
  }
};

// src/Loom.ts
var Loom = class {
  /**
   *
   * @param code
   */
  static make(code) {
    const tokens = new Lexer().tokenize(code);
    const output = [];
    tokens.forEach((token) => {
      output.push(`${token.type}(${token.value})`);
    });
    return output.join("\n");
  }
};
export {
  Loom
};
//# sourceMappingURL=index.js.map