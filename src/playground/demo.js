import { Lexer, EventBus, Reporter } from '../../dist/index.js';

const reporter = new Reporter();
const lexer = new Lexer(new EventBus(), reporter);
console.log(lexer.tokenize('test34 "test ""test {% nla %}" 55'));
reporter.print();