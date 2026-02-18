import Lexer from '@/compiler/tokenization/Lexer';
import EventBus from '@/core/bus/EventBus';
import Reporter from '@/compiler/diagnostics/Reporter';
import { TEventMap } from '@/compiler/types/bus';
import { TokenType } from '@/compiler/types/tokenization';

function createLexer(): { lexer: Lexer; reporter: Reporter } {
    const events = new EventBus<TEventMap>();
    const reporter = new Reporter();
    const lexer = new Lexer(events, reporter);
    return { lexer, reporter };
}

function tokenize(source: string) {
    const { lexer } = createLexer();
    const stream = lexer.tokenize(source);
    return stream.getTokens();
}

describe('Lexer', () => {
    describe('empty input', () => {
        it('returns no tokens for empty string', () => {
            expect(tokenize('')).toEqual([]);
        });

        it('returns no tokens for only whitespace', () => {
            expect(tokenize('   \t  ')).toEqual([]);
        });

        it('returns no tokens for only newlines', () => {
            expect(tokenize('\n\n')).toEqual([]);
        });
    });

    describe('identifiers', () => {
        it('tokenizes a simple identifier', () => {
            const tokens = tokenize('foo');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.IDENT, value: 'foo' });
        });

        it('tokenizes identifier starting with underscore', () => {
            const tokens = tokenize('_private');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.IDENT, value: '_private' });
        });

        it('tokenizes identifier with uppercase', () => {
            const tokens = tokenize('Bar');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.IDENT, value: 'Bar' });
        });

        it('tokenizes identifier with digits after first character', () => {
            const tokens = tokenize('foo42');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.IDENT, value: 'foo42' });
        });

        it('tokenizes multiple identifiers separated by whitespace', () => {
            const tokens = tokenize('foo bar');
            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toMatchObject({ type: TokenType.IDENT, value: 'foo' });
            expect(tokens[1]).toMatchObject({ type: TokenType.IDENT, value: 'bar' });
        });
    });

    describe('numbers', () => {
        it('tokenizes a single digit', () => {
            const tokens = tokenize('0');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '0' });
        });

        it('tokenizes multi-digit number', () => {
            const tokens = tokenize('42');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '42' });
        });

        it('tokenizes number then identifier as separate tokens', () => {
            const tokens = tokenize('42px');
            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '42' });
            expect(tokens[1]).toMatchObject({ type: TokenType.IDENT, value: 'px' });
        });
    });

    describe('symbols', () => {
        it('tokenizes single-character symbols', () => {
            const symbols = ['.', ',', ';', ':', '(', ')', '-', '+', '=', '%', '*', '/', '{', '}'];
            for (const sym of symbols) {
                const tokens = tokenize(sym);
                expect(tokens).toHaveLength(1);
                expect(tokens[0]).toMatchObject({ type: TokenType.SYMBOL, value: sym });
            }
        });

        it('tokenizes symbol followed by identifier', () => {
            const tokens = tokenize('.class');
            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toMatchObject({ type: TokenType.SYMBOL, value: '.' });
            expect(tokens[1]).toMatchObject({ type: TokenType.IDENT, value: 'class' });
        });
    });

    describe('strings', () => {
        it('tokenizes double-quoted string', () => {
            const tokens = tokenize('"hello"');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'hello' });
        });

        it('tokenizes single-quoted string', () => {
            const tokens = tokenize("'world'");
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'world' });
        });

        it('tokenizes backtick-quoted string', () => {
            const tokens = tokenize('`code`');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'code' });
        });

        it('handles escape sequences in strings', () => {
            const tokens = tokenize('"say \\"hi\\""');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'say "hi"' });
        });

        it('tokenizes empty string', () => {
            const tokens = tokenize('""');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: '' });
        });
    });

    describe('raw blocks', () => {
        it('tokenizes raw block content', () => {
            const tokens = tokenize('{% raw %}');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.RAW_BLOCK, value: ' raw ' });
        });

        it('tokenizes raw block with multiple words', () => {
            const tokens = tokenize('{% some css here %}');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.RAW_BLOCK, value: ' some css here ' });
        });

        it('tokenizes two raw blocks', () => {
            const tokens = tokenize('{% a %}{% b %}');
            expect(tokens).toHaveLength(2);
            expect(tokens[0]).toMatchObject({ type: TokenType.RAW_BLOCK, value: ' a ' });
            expect(tokens[1]).toMatchObject({ type: TokenType.RAW_BLOCK, value: ' b ' });
        });
    });

    describe('unknown characters', () => {
        it('tokenizes unknown character as UNKNOWN', () => {
            const tokens = tokenize('[');
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.UNKNOWN, value: '[' });
        });
    });

    describe('position information', () => {
        it('sets start and end position for identifier', () => {
            const tokens = tokenize('ab');
            expect(tokens[0].startPosition).toEqual({ index: 0, line: 1, column: 1 });
            expect(tokens[0].endPosition).toEqual({ index: 2, line: 1, column: 3 });
        });

        it('sets position after newline', () => {
            const tokens = tokenize('\nfoo');
            expect(tokens).toHaveLength(1);
            expect(tokens[0].startPosition).toEqual({ index: 1, line: 2, column: 1 });
            expect(tokens[0].endPosition).toEqual({ index: 4, line: 2, column: 4 });
        });

        it('sets position for string spanning line', () => {
            const tokens = tokenize('"hi"');
            expect(tokens[0].startPosition).toEqual({ index: 0, line: 1, column: 1 });
            expect(tokens[0].endPosition).toEqual({ index: 4, line: 1, column: 5 });
        });
    });

    describe('unterminated string', () => {
        it('emits string token and reports error for unterminated double quote', () => {
            const events = new EventBus<TEventMap>();
            const reporter = new Reporter();
            const lexer = new Lexer(events, reporter);
            const stream = lexer.tokenize('"hello');
            const tokens = stream.getTokens();
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.STRING, value: 'hello' });
            expect(reporter.hasErrors()).toBe(true);
        });
    });

    describe('unterminated raw block', () => {
        it('emits raw block token and reports error for unterminated block', () => {
            const events = new EventBus<TEventMap>();
            const reporter = new Reporter();
            const lexer = new Lexer(events, reporter);
            const stream = lexer.tokenize('{% open');
            const tokens = stream.getTokens();
            expect(tokens).toHaveLength(1);
            expect(tokens[0]).toMatchObject({ type: TokenType.RAW_BLOCK, value: ' open' });
            expect(reporter.hasErrors()).toBe(true);
        });
    });

    describe('event emission', () => {
        it('emits startTokenization when tokenizing', () => {
            const events = new EventBus<TEventMap>();
            const reporter = new Reporter();
            const lexer = new Lexer(events, reporter);
            const payloads: { code: string }[] = [];
            events.on('startTokenization', (p) => payloads.push(p));
            lexer.tokenize('foo');
            expect(payloads).toHaveLength(1);
            expect(payloads[0].code).toBe('foo');
        });
    });
});
