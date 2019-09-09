
import { ScopeAssertion, TestCaseMetadata, LineAssertion, GrammarTestCase } from './model';
import { EOL } from 'os';

const leftArrowAssertRegex = /^\s*<([~]*)([-]+)((?:\s*\w[-\w.]*)*)(?:\s*-)?((?:\s*\w[-\w.]*)*)\s*$/
const upArrowAssertRegex = /^\s*(\^+)((?:\s*\w[-\w.]*)*)(?:\s*-)?((?:\s*\w[-\w.]*)*)\s*$/


export function parseScopeAssertion(testCaseLineNumber: number, commentLength: number, as: String): ScopeAssertion | void {
    let s = as.slice(commentLength)

    let upArrowMatch = upArrowAssertRegex.exec(s)

    if (upArrowMatch !== null) {
        let [_, arrows, scopes = "", exclusions = ""] = upArrowMatch
        let startIdx = commentLength + s.indexOf("^")
        if (scopes === "" && exclusions === "") {
            return undefined;
        } else {
            return <ScopeAssertion>{
                from: startIdx,
                to: startIdx + arrows.length,
                scopes: scopes.split(/\s+/).filter((x) => x),
                exclude: exclusions.split(/\s+/).filter((x) => x)
            }
        }
    }

    let leftArrowMatch = leftArrowAssertRegex.exec(s)

    if (leftArrowMatch !== null) {
        let [_, tildas, dashes, scopes = "", exclusions = ""] = leftArrowMatch
        if (scopes === "" && exclusions === "") {
            return undefined;
        } else {
            return <ScopeAssertion>{
                from: tildas.length,
                to: tildas.length + dashes.length,
                scopes: scopes.split(/\s+/).filter((x) => x),
                exclude: exclusions.split(/\s+/).filter((x) => x)
            }
        }
    }

    return undefined;

}



let headerErrorMessage = "Expecting the first line in the syntax test file to be in the following format:\n" +
    "<comment character(s)> SYNTAX TEST \"<language identifier>\"  (\"description\")?\n"

let headerRegex = /^([^\s]+)\s+SYNTAX\s+TEST\s+"([^"]+)"(?:\s+\"([^"]+)\")?\s*$/

/* 
  parse the first line with the format:
  <comment character(s)> SYNTAX TEST "<language identifier>" <"description">?
*/

export function parseHeader(as: string[]): TestCaseMetadata {
    if (as.length < 1) { throw new Error(headerErrorMessage); }

    let matchResult = headerRegex.exec(as[0])

    if (matchResult === null) {
        throw new Error(headerErrorMessage);
    } else {
        let [_, commentToken, scope, description = ""] = matchResult;
       
        return <TestCaseMetadata>{
            commentToken: commentToken,
            scope: scope,
            description: description
        }
    }

}

export function parseGrammarTestCase(str: string): GrammarTestCase {
    let headerLength = 1;
    let lines = str.split(EOL);
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


    var sourceLineNumber = 0;
    let lineAssertions = <Array<LineAssertion>>[];
    var currentLineAssertion = emptyLineAssertion(headerLength, 0);
    let source = <Array<string>>[]
    rest.forEach((s: string, i: number) => {
        let tcLineNumber = headerLength + i;

        if (s.startsWith(commentToken)) {
            let a = parseScopeAssertion(tcLineNumber, commentToken.length, s)
            if (a !== undefined) {
                currentLineAssertion.scopeAssertions.push(a);
            }
            // if (!skipComments) {
            //     source.push(s)
            //     sourceLineNumber++;
            // }
        } else {
            if (currentLineAssertion.scopeAssertions.length === 0) {
                // ignore existing one
            } else {
                lineAssertions.push(currentLineAssertion)
            }
            currentLineAssertion = emptyLineAssertion(tcLineNumber, sourceLineNumber)
            source.push(s)
            sourceLineNumber++;
        }
    });
    if (currentLineAssertion.scopeAssertions.length !== 0) {
        lineAssertions.push(currentLineAssertion)
    }

    return <GrammarTestCase>{
        metadata: metadata,
        source: source,
        assertions: lineAssertions
    }
}