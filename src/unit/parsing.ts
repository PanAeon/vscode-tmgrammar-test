import { ScopeAssertion, TestCaseMetadata, LineAssertion, GrammarTestCase } from './model'
import { EOL } from 'os'

const leftArrowAssertRegex = /^(\s*)<([~]*)([-]+)((?:\s*\w[-\w.]*)*)(?:\s*-)?((?:\s*\w[-\w.]*)*)\s*$/
const upArrowAssertRegex = /^\s*((?:(?:\^+)\s*)+)((?:\s*\w[-\w.]*)*)(?:\s*-)?((?:\s*\w[-\w.]*)*)\s*$/

export function parseScopeAssertion(testCaseLineNumber: number, commentLength: number, as: String): ScopeAssertion[] {
  let s = as.slice(commentLength)

  if (s.trim().startsWith('^')) {
    let upArrowMatch = upArrowAssertRegex.exec(s)
    if (upArrowMatch !== null) {
      let [, , scopes = '', exclusions = ''] = upArrowMatch

      if (scopes === '' && exclusions === '') {
        throw new Error(
          `Invalid assertion at line ${testCaseLineNumber}:${EOL}${as}${EOL} Missing both required and prohibited scopes`
        )
      } else {
        const result = []
        let startIdx = s.indexOf('^')
        while (startIdx !== -1) {
          let endIndx = startIdx
          while (s[endIndx + 1] === '^') {
            endIndx++
          }
          result.push(<ScopeAssertion>{
            from: commentLength + startIdx,
            to: commentLength + endIndx + 1,
            scopes: scopes.split(/\s+/).filter((x) => x),
            exclude: exclusions.split(/\s+/).filter((x) => x)
          })
          startIdx = s.indexOf('^', endIndx + 1)
        }
        return result
      }
    } else {
      throw new Error(`Invalid assertion at line ${testCaseLineNumber}:${EOL}${as}${EOL}`)
    }
  }

  let leftArrowMatch = leftArrowAssertRegex.exec(s)

  if (leftArrowMatch !== null) {
    let [, , tildas, dashes, scopes = '', exclusions = ''] = leftArrowMatch
    if (scopes === '' && exclusions === '') {
      throw new Error(
        `Invalid assertion at line ${testCaseLineNumber}:${EOL}${as}${EOL} Missing both required and prohibited scopes`
      )
    } else {
      return [
        {
          from: tildas.length,
          to: tildas.length + dashes.length,
          scopes: scopes.split(/\s+/).filter((x) => x),
          exclude: exclusions.split(/\s+/).filter((x) => x)
        }
      ]
    }
  }

  return []
}

let headerErrorMessage =
  `Expecting the first line in the syntax test file to be in the following format:${EOL}` +
  `<comment character(s)> SYNTAX TEST \"<language identifier>\"  (\"description\")?${EOL}`

let headerRegex = /^([^\s]+)\s+SYNTAX\s+TEST\s+"([^"]+)"(?:\s+\"([^"]+)\")?\s*$/

/**
 * parse the first line with the format:
 * <comment character(s)> SYNTAX TEST "<language identifier>" <"description">? ([+-]<flag>)*
 */
export function parseHeader(as: string[]): TestCaseMetadata {
  if (as.length < 1) {
    throw new Error(headerErrorMessage)
  }

  let matchResult = headerRegex.exec(as[0])

  if (matchResult === null) {
    throw new Error(headerErrorMessage)
  } else {
    let [, commentToken, scope, description = ''] = matchResult
    return <TestCaseMetadata>{
      commentToken: commentToken,
      scope: scope,
      description: description
    }
  }
}

export function parseGrammarTestCase(str: string): GrammarTestCase {
  let headerLength = 1
  let lines = str.split(/\r\n|\n/)
  let metadata = parseHeader(lines)
  let { commentToken } = metadata
  let rest = lines.slice(headerLength)
  

  function emptyLineAssertion(tcLineNumber: number, srcLineNumber: number): LineAssertion {
    return <LineAssertion>{
      testCaseLineNumber: tcLineNumber,
      sourceLineNumber: srcLineNumber,
      scopeAssertions: []
    }
  }

  var sourceLineNumber = 0
  let lineAssertions = <Array<LineAssertion>>[]
  var currentLineAssertion = emptyLineAssertion(headerLength, 0)
  let source = <Array<string>>[]
  rest.forEach((s: string, i: number) => {
    let tcLineNumber = headerLength + i

    if (s.startsWith(commentToken)) {
      let as = parseScopeAssertion(tcLineNumber, commentToken.length, s)
      currentLineAssertion.scopeAssertions = [...currentLineAssertion.scopeAssertions, ...as]
    } else {
      if (currentLineAssertion.scopeAssertions.length !== 0) {
        lineAssertions.push(currentLineAssertion)
      }
      currentLineAssertion = emptyLineAssertion(tcLineNumber, sourceLineNumber)
      source.push(s)
      sourceLineNumber++
    }
  })
  if (currentLineAssertion.scopeAssertions.length !== 0) {
    lineAssertions.push(currentLineAssertion)
  }

  return <GrammarTestCase>{
    metadata: metadata,
    source: source,
    assertions: lineAssertions
  }
}
