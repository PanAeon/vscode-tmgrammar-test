// 'use strict';
// import { expect } from 'chai'
// import * as fs from 'fs'

// import { parseGrammarTestCase, GrammarTestCase, TestFailure, runGrammarTestCase, createRegistry } from '../src/index'

// var registry = createRegistry({
//     'source.dhall': './test/resources/dhall.tmLanguage.json'
// });

// function loadFile(filename:string): string {
//         return fs.readFileSync(filename).toString();
// }

 
// describe('Grammar test case', () => {
//     it('should report no errors on correct grammar test', () => {
//         return runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/successful.test.dhall"))).then(result => {
//             expect(result).to.eql([]);
//         });
//     });
//     it('should report missing scopes', () => {
//         return runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/missing.scopes.test.dhall"))).then(result => {
//             expect(result).to.eql(
//                 [ { missing: [ 'm1', 'm2.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 11,
//     srcLine: 9,
//     start: 4,
//     end: 5 },
//   { missing: [ 'm3.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 6,
//     end: 16 },
//   { missing: [ 'm4.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 17,
//     end: 18 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 19,
//     end: 20 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 20,
//     end: 26 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 26,
//     end: 28 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 28,
//     end: 32 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 32,
//     end: 33 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 33,
//     end: 44 },
//   { missing: [ 'm5.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 13,
//     srcLine: 10,
//     start: 44,
//     end: 45 },
//   { missing: [ 'm6.foo' ],
//     misordered: undefined,
//     unexpected: [],
//     line: 20,
//     srcLine: 12,
//     start: 0,
//     end: 1 } ]
//             );
//         });
//     });
//     it('should report unexpected scopes', () => {
//         return runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/unexpected.scopes.test.dhall"))).then(result => {
//             expect(result).to.eql([ { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 11,
//                 srcLine: 9,
//                 start: 4,
//                 end: 5 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'variable.object.property.dhall', 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 6,
//                 end: 16 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 19,
//                 end: 20 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 20,
//                 end: 26 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 26,
//                 end: 28 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 28,
//                 end: 32 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 32,
//                 end: 33 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 33,
//                 end: 44 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'source.dhall' ],
//                 line: 13,
//                 srcLine: 10,
//                 start: 44,
//                 end: 45 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected: [ 'meta.label.dhall' ],
//                 line: 17,
//                 srcLine: 11,
//                 start: 28,
//                 end: 32 },
//               { missing: [],
//                 misordered: undefined,
//                 unexpected:
//                  [ 'meta.declaration.data.record.block.dhall',
//                    'keyword.operator.record.end.dhall' ],
//                 line: 20,
//                 srcLine: 12,
//                 start: 0,
//                 end: 1 } ]);
//         });
//     });
//     it('should report out of place scopes', () => {
//         return runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/misplaced.scopes.test.dhall"))).then(result => {
//             expect(result).to.eql([ { missing: [],
//                 misordered:
//                  { expected:
//                     [ 'punctuation.separator.dictionary.key-value.dhall',
//                       'source.dhall' ],
//                    actual:
//                     [ 'source.dhall',
//                       'punctuation.separator.dictionary.key-value.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 17,
//                 end: 18 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 19,
//                 end: 20 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 20,
//                 end: 26 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 26,
//                 end: 28 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 28,
//                 end: 32 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 32,
//                 end: 33 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 33,
//                 end: 44 },
//               { missing: [],
//                 misordered:
//                  { expected: [ 'string.quoted.double.dhall', 'source.dhall' ],
//                    actual: [ 'source.dhall', 'string.quoted.double.dhall' ] },
//                 unexpected: [],
//                 line: 13,
//                 srcLine: 10,
//                 start: 44,
//                 end: 45 },
//               { missing: [],
//                 misordered:
//                  { expected:
//                     [ 'keyword.operator.record.end.dhall',
//                       'meta.declaration.data.record.block.dhall' ],
//                    actual:
//                     [ 'meta.declaration.data.record.block.dhall',
//                       'keyword.operator.record.end.dhall' ] },
//                 unexpected: [],
//                 line: 20,
//                 srcLine: 12,
//                 start: 0,
//                 end: 1 } ]);
//         });
//     });
//     it('should report error when line assertion referes to non existing token', () => {
//         return runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/out.of.bounds.test.dhall"))).then(result => {
//             expect(result).to.eql(
//                 [
//                   {
//                     "end": 32,
//                     "line": 5,
//                     "misordered": undefined,
//                     "missing": [
//                       "missing.scope"
//                     ],
//                     "srcLine": 3,
//                     "start": 30
//                   }
//                 ]
//             );
//         });
//     });
// });