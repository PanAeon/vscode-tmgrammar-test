import * as fs from 'fs';
import * as tm from 'vscode-textmate';
import { GrammarTestCase, TestFailure } from './model';
import { parseGrammarTestCase } from './parsing';

export { parseGrammarTestCase, GrammarTestCase, TestFailure, missingScopes_ };

export async function runGrammarTestCase(
  registry: tm.Registry,
  testCase: GrammarTestCase
): Promise<TestFailure[]> {
  return registry
    .loadGrammar(testCase.metadata.scope)
    .then((grammar: tm.IGrammar | null) => {
      if (!grammar) {
        throw new Error(`Could not load scope ${testCase.metadata.scope}`);
      }

      const assertions = toMap((x) => x.sourceLineNumber, testCase.assertions);

      let ruleStack: tm.StackElement = <any>null;

      let failures: TestFailure[] = [];

      testCase.source.forEach((line: string, n: number) => {
        var { tokens, ruleStack: ruleStack1 } = grammar.tokenizeLine(
          line,
          ruleStack
        );
        ruleStack = ruleStack1;

        if (assertions[n] !== undefined) {
          let { testCaseLineNumber, scopeAssertions } = assertions[n];

          scopeAssertions.forEach(
            ({ from, to, scopes: requiredScopes, exclude: excludedScopes }) => {
              const xs = tokens.filter(
                (t) => from < t.endIndex && to > t.startIndex
              );
              if (xs.length === 0 && requiredScopes.length > 0) {
                failures.push(<TestFailure>{
                  missing: requiredScopes,
                  unexpected: [],
                  actual: [],
                  line: testCaseLineNumber,
                  srcLine: n,
                  start: from,
                  end: to
                });
              } else {
                xs.forEach((token) => {
                  const unexpected = excludedScopes.filter((s) => {
                    return token.scopes.includes(s);
                  });
                  const missing = missingScopes_(requiredScopes, token.scopes);

                  if (missing.length || unexpected.length) {
                    failures.push(<TestFailure>{
                      missing: missing,
                      actual: token.scopes,
                      unexpected: unexpected,
                      line: testCaseLineNumber,
                      srcLine: n,
                      start: token.startIndex,
                      end: token.endIndex
                    });
                  }
                });
              }
            }
          );
        }
      });
      return failures;
    });
}

export function createRegistryFromGrammars(
  grammars: Array<{ path: string; content: string }>
): tm.Registry {
  let grammarIndex: { [key: string]: tm.IRawGrammar } = {};

  for (const grammar of grammars) {
    const { path, content } = grammar;
    let rawGrammar = tm.parseRawGrammar(content, path);
    grammarIndex[rawGrammar.scopeName] = rawGrammar;
  }

  return new tm.Registry(<tm.RegistryOptions>{
    loadGrammar: (scopeName) => {
      if (grammarIndex[scopeName] !== undefined) {
        return new Promise((fulfill, _) => {
          fulfill(grammarIndex[scopeName]);
        });
      }
      console.warn(`grammar not found for "${scopeName}"`);
      return null;
    }
  });
}

export function createRegistry(grammarPaths: string[]): tm.Registry {
  return createRegistryFromGrammars(
    grammarPaths.map((path) => {
      return {
        path,
        content: fs.readFileSync(path).toString()
      };
    })
  );
}

// ------------------------------------------------------------ helper functions --------------------------------------

function missingScopes_(rs: string[], as: string[]): string[] {
  let i = 0,
    j = 0;
  while (i < as.length && j < rs.length) {
    if (as[i] === rs[j]) {
      i++;
      j++;
    } else {
      i++;
    }
  }

  return j === rs.length ? [] : rs.slice(j);
}

function toMap<T>(f: (x: T) => number, xs: T[]): { [key: number]: T } {
  return xs.reduce((m: { [key: number]: T }, x: T) => {
    m[f(x)] = x;
    return m;
  }, {});
}
