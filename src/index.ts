#!/usr/bin/env node

import * as fs from 'fs';
import { inspect } from 'util';

import chalk from 'chalk';
import path from 'path';
import program from 'commander';

import glob from 'glob';

import { createRegistry, runGrammarTestCase, parseGrammarTestCase, GrammarTestCase, TestFailure } from 'vscode-tmgrammar-test-helper';

// * don't forget the '' vscode-tmgrammar-test -s source.dhall -g testcase/dhall.tmLanguage.json -t '**/*.dhall'
program
  .version('0.0.1')
  .description("Run Textmate grammar test cases using vscode-textmate")
  .option('-s, --scope <scope>', 'Language scope, e.g. source.dhall')
  .option('-g, --grammar <grammar>', 'Path to a grammar file, either .json or .xml')
  .option('-t, --testcases <glob>', 'A glob pattern which specifies testcases to run, e.g. \'./tests/**/test*.dhall\'. Quotes are important!')
  .parse(process.argv);


if (program.scope === undefined || program.grammar === undefined || program.testcases === undefined) {
    program.help()
}




let grammarPaths : { [key: string]: string } = {}

grammarPaths[program.scope] = program.grammar;


const registry = createRegistry(grammarPaths) ; 

// FIXME: alignment, text setup, etc ..., pretty printing for duck's sake!

// FIXME: actually add LICENSE !

function displayTestResult(filename: string, testCase: GrammarTestCase, failures: TestFailure[]) {
    if (failures.length === 0) {
        console.log(chalk.green("[OK]") + `${filename} run successfuly.`)
    } else {
        console.log(chalk.red("[ERROR]") + `${filename} failed.`)
        console.log(failures);
    }
    
}

function handleGrammarTestError(filename: string, testCase: GrammarTestCase, reason:any) {
    console.log(reason);
}


glob(program.testcases, (err,files) => {
    if (err !== null) {
        console.log(chalk.red("ERROR") + " glob pattern is incorrect: '" + chalk.gray(program.testcases) + "'")
        console.log(err)
        return;
    }
    files.forEach(filename => {
        try {
          const testCase = parseGrammarTestCase(fs.readFileSync(filename).toString())
          runGrammarTestCase(registry, testCase).then( 
              (failures:TestFailure[]) => { displayTestResult(filename, testCase, failures) }, 
              (error: any) => { handleGrammarTestError(filename, testCase, error) })
        } catch(error) {
            console.log(error); // ! FIXME: bad, need to thread into the general error for consistent display, also EXIT VALUE !!!
        }
    });
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
});