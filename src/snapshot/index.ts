import * as tm from 'vscode-textmate';
import { AnnotatedLine } from './model';

export async function getVSCodeTokens(
  registry: tm.Registry,
  scope: string,
  source: string
): Promise<AnnotatedLine[]> {
  return registry.loadGrammar(scope).then((grammar: tm.IGrammar | null) => {
    if (!grammar) {
      throw new Error(`Could not load scope ${scope}`);
    }

    let ruleStack: tm.StackElement = <any>null;

    return source.split(/\r\n|\n/).map((line: string, n: number) => {
      var { tokens, ruleStack: ruleStack1 } = grammar.tokenizeLine(
        line,
        ruleStack
      );
      ruleStack = ruleStack1;

      return <AnnotatedLine>{
        src: line,
        tokens: tokens
      };
    });
  });
}
