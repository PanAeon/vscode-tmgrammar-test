#!/usr/bin/env node

import * as fs from 'fs'
import chalk from 'chalk'
import { program } from 'commander'
import glob from 'glob'
import { runGrammarTestCase, parseGrammarTestCase, GrammarTestCase, TestFailure } from './unit/index'
import { Reporter, ConsoleCompactReporter, ConsoleFullReporter, XunitReporter, CompositeReporter } from './unit/reporter'

import { createRegistry, loadConfiguration, IGrammarConfig } from './common/index'


let packageJson = require('../package.json')

function collectGrammarOpts(value: String, previous: String[]): String[] {
  return previous.concat([value])
}

program
  .description('Run Textmate grammar test cases using vscode-textmate')
  .option(
    '-g, --grammar <grammar>',
    "Path to a grammar file. Multiple options supported. 'scopeName' is taken from the grammar",
    collectGrammarOpts,
    []
  )
  .option('--config <configuration.json>', 'Path to the language configuration, package.json by default')
  .option('-c, --compact', 'Display output in the compact format, which is easier to use with VSCode problem matchers')
  .option('--xunit-report <report.xml>', 'Path to directory where test reports in the XUnit format will be emitted in addition to console output')
  .version(packageJson.version)
  .argument(
    '<testcases...>',
    'A glob pattern(s) which specifies testcases to run, e.g. "./tests/**/test*.dhall". Quotes are important!'
  )
  .parse(process.argv)

const options = program.opts()


const TestFailed = -1
const TestSuccessful = 0

let { grammars } = loadConfiguration(options.config, options.scope, options.grammar)
const registry = createRegistry(grammars)

if (options.validate) {
  if (!!registry && typeof registry === 'object') {
    process.exit(0)
  } else {
    process.exit(1)
  }
}


const consoleReporter = options.compact 
  ? new ConsoleCompactReporter() 
  : new ConsoleFullReporter()
const reporter: Reporter  = options.xunitReport
  ? new CompositeReporter(consoleReporter, new XunitReporter(options.xunitReport))
  : consoleReporter

const rawTestCases = program.args.map((x) => glob.sync(x)).flat()

if (rawTestCases.length === 0) {
  console.log(chalk.red('ERROR') + ' no test cases found')
  process.exit(-1)
}

const testResults: Promise<number[]> = Promise.all(
  rawTestCases.map((filename): Promise<number> => {
    let tc: GrammarTestCase | undefined = undefined
    try {
      tc = parseGrammarTestCase(fs.readFileSync(filename).toString())
    } catch (error) {
      reporter.reportParseError(filename, error)
      return new Promise((resolve, reject) => {
        resolve(TestFailed)
      })
    }
    let testCase = tc as GrammarTestCase
    return runGrammarTestCase(registry, testCase)
      .then((failures) => {
        reporter.reportTestResult(filename, testCase, failures)
        return failures.length === 0 ? TestSuccessful : TestFailed
      })
      .catch((error: any) => {
        reporter.reportGrammarTestError(filename, testCase, error)
        return TestFailed
      })
  })
)

testResults.then((xs) => {
  reporter.reportSuiteResult()
  const result = xs.reduce((a, b) => a + b, 0)
  if (result === TestSuccessful) {
    process.exit(0)
  } else {
    process.exit(-1)
  }
})
