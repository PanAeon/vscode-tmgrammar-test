import { IToken } from 'vscode-textmate';

export { IToken };

export interface AnnotatedLine {
  src: string;
  tokens: [IToken];
}
