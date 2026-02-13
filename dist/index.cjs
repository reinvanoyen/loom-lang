var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Loom: () => Loom
});
module.exports = __toCommonJS(index_exports);

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

// src/parsing/Node.ts
var Node = class _Node {
  /**
   *
   * @param value
   */
  constructor(value = "") {
    /**
     *
     * @protected
     */
    this.parent = null;
    /**
     *
     * @protected
     */
    this.children = [];
    /**
     *
     * @protected
     */
    this.attributes = {};
    this.value = value;
  }
  /**
   *
   */
  getName() {
    return this.constructor.name;
  }
  /**
   *
   * @param node
   */
  setParent(node) {
    this.parent = node;
  }
  /**
   *
   */
  getParent() {
    return this.parent;
  }
  /**
   *
   */
  getValue() {
    return this.value;
  }
  /**
   *
   * @param value
   */
  setValue(value) {
    this.value = value;
  }
  /**
   *
   * @param node
   */
  addChild(node) {
    this.children.push(node);
  }
  /**
   *
   */
  getChildren() {
    return this.children;
  }
  /**
   *
   */
  hasChildren() {
    return this.children.length > 0;
  }
  /**
   *
   * @param name
   * @param value
   */
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  /**
   *
   * @param name
   */
  getAttribute(name) {
    return this.attributes[name] || null;
  }
  /**
   *
   */
  getAttributes() {
    return this.attributes;
  }
  /**
   *
   */
  removeLastChild() {
    this.children.pop();
  }
  /**
   *
   * @param _parser
   */
  parse(_parser) {
    return false;
  }
  /**
   *
   * @param _compiler
   */
  compile() {
  }
  print() {
    const printNode = (node, indentAmount = 0) => {
      const nodeName = node.getName();
      const nodeValue = node.getValue();
      const attributes = node.getAttributes();
      const attributesString = [];
      for (const attribute in attributes) {
        let attrValue = attributes[attribute];
        if (attrValue instanceof _Node) {
          const attrNodeValue = attrValue.getValue();
          attrValue = `${attrValue.getName()}${attrNodeValue ? `(${attrNodeValue})` : ""}`;
        }
        attributesString.push(`${attribute}=${attrValue}`);
      }
      const tabs = indentAmount > 0 ? "   ".repeat(indentAmount - 1) + "\u2514\u2500\u2500" : "";
      const output = [`${tabs}${nodeName}${nodeValue ? `(${nodeValue})` : ""} ${attributesString.join(" ")}`];
      node.getChildren().forEach((childNode) => {
        output.push(printNode(childNode, indentAmount + 1));
      });
      return output.join("\n");
    };
    return printNode(this);
  }
};

// src/nodes/VariantDefinition.ts
var VariantDefinition = class extends Node {
  static parse(parser) {
    if (parser.acceptWithValue("Symbol" /* SYMBOL */, "@")) {
      parser.advance(9);
      return true;
    }
    return false;
  }
  compile() {
  }
};

// src/nodes/ClassNode.ts
var ClassNode = class _ClassNode extends Node {
  static parse(parser) {
    if (parser.skipWithValue("Ident" /* IDENT */, "class")) {
      parser.insert(new _ClassNode());
      parser.traverseUp();
      if (parser.expect("Ident" /* IDENT */)) {
        parser.setAttribute("name", parser.getCurrentValue());
        parser.advance();
      }
      parser.expectWithValue("Symbol" /* SYMBOL */, "{");
      parser.advance();
      while (VariantDefinition.parse(parser)) ;
      if (parser.expectWithValue("Symbol" /* SYMBOL */, "}")) {
        parser.out();
        parser.advance();
      }
      return true;
    }
    return false;
  }
  compile() {
  }
};

// src/parsing/AstNode.ts
var AstNode = class extends Node {
  static parse(parser) {
    while (ClassNode.parse(parser)) ;
    return true;
  }
  compile() {
  }
};

// src/parsing/Parser.ts
var Parser = class {
  constructor() {
    /**
     * The current position of the cursor
     * @private
     */
    this.cursor = 0;
    /**
     * The Abstract Syntax Tree (AST) currently being build (output)
     * @private
     */
    this.ast = new AstNode();
    /**
     * The current scope, which is the Node in which we're currently parsing
     * @private
     */
    this.scope = this.ast;
  }
  /**
   * Parse a TokenStream into an Abstract Syntax Tree (AST)
   * @param tokens
   */
  parse(tokens) {
    this.setTokenStream(tokens);
    this.parseAll();
    return this.ast;
  }
  /**
   * Set the TokenStream
   * @param tokens
   */
  setTokenStream(tokens) {
    this.tokens = tokens;
  }
  /**
   * Parse all tokens in the TokenStream, starting from the cursor position
   */
  parseAll() {
    if (!this.tokens.length) {
      return;
    }
    if (this.cursor > this.tokens.length - 1) {
      return;
    }
    if (AstNode.parse(this)) {
      this.parseAll();
    }
  }
  /**
   * Get the Token at the cursor position
   */
  getCurrentToken() {
    return this.tokens[this.cursor];
  }
  /**
   * Get the Token at the offset of the cursor position
   * @param offset
   */
  getOffsetToken(offset) {
    return this.tokens[this.cursor + offset];
  }
  /**
   * Set a value as attribute to the current scope Node
   * If no explicit value was given, the last inserted Node will be used as value
   * @param name
   * @param value
   */
  setAttribute(name, value = null) {
    if (value === null) {
      value = this.getLastNode();
      this.getScope().removeLastChild();
    }
    this.getScope().setAttribute(name, value);
  }
  /**
   * Get the value of the current token
   */
  getCurrentValue() {
    return this.getCurrentToken().value;
  }
  /**
   * Advance the cursor position by a certain offset
   * @param offset
   */
  advance(offset = 1) {
    this.cursor = this.cursor + offset;
  }
  /**
   * Accept a token of the given type at this cursor position
   * @param type
   */
  accept(type) {
    const token = this.getCurrentToken();
    return token && token.type === type;
  }
  /**
   * Accept a token of the given type and with given value at this cursor position
   * @param type
   * @param value
   */
  acceptWithValue(type, value) {
    const token = this.getCurrentToken();
    return token && token.type === type && token.value === value;
  }
  /**
   * Accept a token of the given type at the given offset of this cursor position
   * @param type
   * @param offset
   */
  acceptAt(type, offset) {
    const token = this.getOffsetToken(offset);
    return token && token.type === type;
  }
  /**
   * Accept a token of the given type and with given value at the given offset of this cursor position
   * @param type
   * @param offset
   * @param value
   */
  acceptAtWithValue(type, offset, value) {
    const token = this.getOffsetToken(offset);
    return token && token.type === type && token.value === value;
  }
  /**
   * Skip a token of the given type at this cursor position
   * @param type
   */
  skip(type) {
    if (this.accept(type)) {
      this.advance();
      return true;
    }
    return false;
  }
  /**
   * Skip the token at this cursor position if it's of the given type and has the given value
   * @param type
   * @param value
   */
  skipWithValue(type, value) {
    if (this.acceptWithValue(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }
  /**
   * Expect a token of the given type at this cursor position
   * @param type
   */
  expect(type) {
    if (this.accept(type)) {
      return true;
    }
    throw new Error("Unexpected token");
  }
  /**
   * Expect a token of the given type with give value at this cursor position
   * @param type
   * @param value
   */
  expectWithValue(type, value) {
    if (this.acceptWithValue(type, value)) {
      return true;
    }
    throw new Error("Unexpected token");
  }
  /**
   * Expect a token of the given type and with given value at the given offset of this cursor position
   * @param type
   * @param offset
   * @param value
   */
  expectAtWithValue(type, offset, value) {
    if (this.acceptAtWithValue(type, offset, value)) {
      return true;
    }
    throw new Error("Unexpected token");
  }
  /**
   * Point the scope to the last inserted Node
   */
  in() {
    this.setScope(this.getLastNode());
  }
  /**
   * Point the scope to the parent of the current scope
   */
  out() {
    this.setScope(this.getScope().getParent());
  }
  /**
   * Alias of in()
   */
  traverseUp() {
    this.in();
  }
  /**
   * Alias of out()
   */
  traverseDown() {
    this.out();
  }
  /**
   * Get the current scope Node
   */
  getScope() {
    return this.scope;
  }
  /**
   * Get the last inserted Node
   */
  getLastNode() {
    return this.scope.getChildren()[this.scope.getChildren().length - 1];
  }
  /**
   * Insert a Node into the current scope
   * @param node
   */
  insert(node) {
    node.setParent(this.scope);
    this.scope.addChild(node);
  }
  /**
   * Set the current scope
   * @param node
   */
  setScope(node) {
    this.scope = node;
  }
  /**
   * Wrap the last inserted Node with another Node, the scope will be the wrapping Node
   * @param node
   */
  wrap(node) {
    const last = this.getLastNode();
    this.getScope().removeLastChild();
    this.insert(node);
    this.traverseUp();
    this.insert(last);
  }
  /**
   * Get the built Abstract Syntax Tree (AST)
   */
  getAst() {
    return this.ast;
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
    const ast = new Parser().parse(tokens);
    console.log(ast.getChildren());
    const output = [];
    tokens.forEach((token) => {
      output.push(token.value);
    });
    return output.join(" ");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Loom
});
//# sourceMappingURL=index.cjs.map