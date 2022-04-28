import * as fs from 'fs'
import * as path from 'path'
import * as tm from 'vscode-textmate'
import * as oniguruma from 'vscode-oniguruma'
import { IGrammarConfig } from './model'

export { IGrammarConfig }

export function createRegistry(gs: IGrammarConfig[]): tm.Registry {
  return createRegistryFromGrammars(
    gs.map((grammar) => {
      return {
        grammar,
        content: fs.readFileSync(grammar.path).toString()
      }
    })
  )
}

export function createRegistryFromGrammars(grammars: Array<{ grammar: IGrammarConfig; content: string }>): tm.Registry {
  let grammarIndex: { [key: string]: tm.IRawGrammar } = {}

  let _injections: { [scopeName: string]: string[] } = {}

  for (const g of grammars) {
    const { grammar, content } = g
    let rawGrammar = tm.parseRawGrammar(content, grammar.path)

    grammarIndex[grammar.scopeName || rawGrammar.scopeName] = rawGrammar
    if (grammar.injectTo) {
      for (let injectScope of grammar.injectTo) {
        let injections = _injections[injectScope]
        if (!injections) {
          _injections[injectScope] = injections = []
        }
        injections.push(grammar.scopeName)
      }
    }
  }

  const wasmPath = require.resolve('vscode-oniguruma').replace(/main\.js$/, 'onig.wasm')
  const wasmBin = fs.readFileSync(wasmPath).buffer
  const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
      createOnigScanner(patterns: any) {
        return new oniguruma.OnigScanner(patterns)
      },
      createOnigString(s: any) {
        return new oniguruma.OnigString(s)
      }
    }
  })

  return new tm.Registry(<tm.RegistryOptions>{
    onigLib: vscodeOnigurumaLib,
    loadGrammar: (scopeName) => {
      if (grammarIndex[scopeName] !== undefined) {
        return new Promise((fulfill, _) => {
          fulfill(grammarIndex[scopeName])
        })
      }
      console.warn(`grammar not found for "${scopeName}"`)
      return null
    },
    getInjections: (scopeName) => {
      const xs = scopeName.split('.')
      let injections: string[] = []
      for (let i = 1; i <= xs.length; i++) {
        const subScopeName = xs.slice(0, i).join('.')
        injections = [...injections, ...(_injections[subScopeName] || [])]
      }
      return injections
    }
  })
}

export function loadConfiguration(
  config: any,
  scope: any,
  grammar: any
): { grammars: IGrammarConfig[]; extensionToScope: (ext: string) => string | undefined } {
  const configPath = config || 'package.json'

  let grammars: IGrammarConfig[] = []
  let extensionToScope: (ext: string) => string | undefined = (_) => scope || undefined

  if (grammar) {
    const xs = grammar.map((path: string) => ({ path, scopeName: '' }))
    grammars.push(...xs)
  }

  if (fs.existsSync(configPath)) {
    const json = JSON.parse(fs.readFileSync(configPath).toString())
    let xs: [IGrammarConfig] = json?.contributes?.grammars || []
    const dirPath = path.dirname(configPath)
    xs.forEach((x) => {
      x.path = path.join(dirPath, x.path)
    })
    grammars.push(...xs)

    let ys = json?.contributes?.languages || []

    let langToScope = Object.assign(
      {},
      ...grammars.filter((x) => x.language).map((x) => ({ [x.language || '']: x.scopeName }))
    )
    let extToLang = Object.assign({}, ...ys.map((x: any) => x.extensions.map((e: any) => ({ [e]: x.id }))).flat())
    extensionToScope = (ext) => scope || langToScope[extToLang[ext]]
  }
  return { grammars, extensionToScope }
}
