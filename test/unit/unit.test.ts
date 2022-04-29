'use strict'
import { expect } from 'chai'
import * as fs from 'fs'

import { parseGrammarTestCase, runGrammarTestCase } from '../../src/unit/index'
import { createRegistry } from '../../src/common/index'

var registry = createRegistry([
  {
    scopeName: 'source.dhall',
    path: './test/resources/dhall.tmLanguage.json'
  },
  {
    scopeName: 'source.terraform',
    path: './test/resources/terraform.tmLanguage.json'
  }
])

function loadFile(filename: string): string {
  return fs.readFileSync(filename).toString()
}

describe('Grammar test case', () => {
  it('should report no errors on correct grammar test', () => {
    return runGrammarTestCase(registry, parseGrammarTestCase(loadFile('./test/resources/successful.test.dhall'))).then(
      (result) => {
        expect(result).to.eql([])
      }
    )
  })
  it('should report missing scopes', () => {
    return runGrammarTestCase(
      registry,
      parseGrammarTestCase(loadFile('./test/resources/missing.scopes.test.dhall'))
    ).then((result) => {
      expect(result).to.eql([
        {
          missing: ['m1', 'keyword.operator.record.begin.dhall', 'm2.foo'],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'keyword.operator.record.begin.dhall'],
          unexpected: [],
          line: 11,
          srcLine: 10,
          start: 4,
          end: 5
        },
        {
          missing: ['m3.foo', 'variable.object.property.dhall'],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'variable.object.property.dhall'],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 6,
          end: 16
        },
        {
          missing: ['m4.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'punctuation.separator.dictionary.key-value.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 17,
          end: 18
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 19,
          end: 20
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 20,
          end: 26
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.begin.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 26,
          end: 28
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'meta.label.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 28,
          end: 32
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.end.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 32,
          end: 33
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 33,
          end: 44
        },
        {
          missing: ['m5.foo'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 44,
          end: 45
        },
        {
          missing: ['m6.foo'],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'keyword.operator.record.end.dhall'],
          unexpected: [],
          line: 20,
          srcLine: 13,
          start: 0,
          end: 1
        }
      ])
    })
  })
  it('should report unexpected scopes', () => {
    return runGrammarTestCase(
      registry,
      parseGrammarTestCase(loadFile('./test/resources/unexpected.scopes.test.dhall'))
    ).then((result) => {
      expect(result).to.eql([
        {
          missing: [],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'keyword.operator.record.begin.dhall'],
          unexpected: ['source.dhall'],
          line: 11,
          srcLine: 10,
          start: 4,
          end: 5
        },
        {
          missing: [],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'variable.object.property.dhall'],
          unexpected: ['variable.object.property.dhall', 'source.dhall'],
          line: 13,
          srcLine: 11,
          start: 6,
          end: 16
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 19,
          end: 20
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 20,
          end: 26
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.begin.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 26,
          end: 28
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'meta.label.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 28,
          end: 32
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.end.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 32,
          end: 33
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 33,
          end: 44
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: ['source.dhall'],
          line: 13,
          srcLine: 11,
          start: 44,
          end: 45
        },
        {
          missing: [],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'meta.label.dhall'
          ],
          unexpected: ['meta.label.dhall'],
          line: 17,
          srcLine: 12,
          start: 28,
          end: 32
        },
        {
          missing: [],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'keyword.operator.record.end.dhall'],
          unexpected: ['meta.declaration.data.record.block.dhall', 'keyword.operator.record.end.dhall'],
          line: 20,
          srcLine: 13,
          start: 0,
          end: 1
        }
      ])
    })
  })
  it('should report out of place scopes', () => {
    return runGrammarTestCase(
      registry,
      parseGrammarTestCase(loadFile('./test/resources/misplaced.scopes.test.dhall'))
    ).then((result) => {
      expect(result).to.eql([
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'punctuation.separator.dictionary.key-value.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 17,
          end: 18
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 19,
          end: 20
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 20,
          end: 26
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.begin.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 26,
          end: 28
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'meta.label.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 28,
          end: 32
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall',
            'constant.other.placeholder.dhall',
            'punctuation.section.curly.end.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 32,
          end: 33
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 33,
          end: 44
        },
        {
          missing: ['source.dhall'],
          actual: [
            'source.dhall',
            'meta.declaration.data.record.block.dhall',
            'meta.declaration.data.record.literal.dhall',
            'string.quoted.double.dhall'
          ],
          unexpected: [],
          line: 13,
          srcLine: 11,
          start: 44,
          end: 45
        },
        {
          missing: ['meta.declaration.data.record.block.dhall'],
          actual: ['source.dhall', 'meta.declaration.data.record.block.dhall', 'keyword.operator.record.end.dhall'],
          unexpected: [],
          line: 20,
          srcLine: 13,
          start: 0,
          end: 1
        }
      ])
    })
  })
  it('should report error when line assertion referes to non existing token', () => {
    return runGrammarTestCase(
      registry,
      parseGrammarTestCase(loadFile('./test/resources/out.of.bounds.test.dhall'))
    ).then((result) => {
      expect(result).to.eql([
        {
          end: 32,
          line: 5,
          actual: [],
          missing: ['missing.scope'],
          srcLine: 4,
          start: 30,
          unexpected: []
        }
      ])
    })
  })
  it('should count line with comment token and no assertions as a source line', () => {
    return runGrammarTestCase(registry, parseGrammarTestCase(loadFile('./test/resources/sourceLineA.tf'))).then(
      (result) => {
        expect(result).to.eql([])
      }
    )
  })
})
