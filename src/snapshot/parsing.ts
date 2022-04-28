import { AnnotatedLine, IToken } from './model'

export function parseSnap(s: string): AnnotatedLine[] {
  let result: AnnotatedLine[] = []
  let ls = s.split(/\r\n|\n/)
  let i = 0
  while (i < ls.length) {
    let l = ls[i]
    if (l.startsWith('>')) {
      const src = l.substring(1)
      i++
      let tokens: IToken[] = []
      while (i < ls.length && ls[i].startsWith('#')) {
        const startIndex = ls[i].indexOf('^')
        const endIndex = ls[i].indexOf(' ', startIndex)
        const scopes = ls[i]
          .substring(endIndex + 1)
          .split(/\s+/)
          .filter((x) => x !== '')
        tokens.push(<IToken>{
          startIndex: startIndex - 1,
          endIndex: endIndex - 1,
          scopes: scopes
        })
        i++
      }
      result.push(<AnnotatedLine>{
        src: src,
        tokens: tokens
      })
    } else {
      i++
    }
  }

  return result
}

export function renderSnap(xs: AnnotatedLine[]): string {
  let result: string[] = []
  xs.forEach((line) => {
    result.push('>' + line.src)
    if (line.src.trim().length > 0) {
      line.tokens.forEach((token) => {
        result.push(
          '#' +
            ' '.repeat(token.startIndex) +
            '^'.repeat(token.endIndex - token.startIndex) +
            ' ' +
            token.scopes.join(' ')
        )
      })
    }
  })
  return result.join('\n')
}
