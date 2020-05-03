#!/usr/bin/env node

import * as fs from 'fs';

import * as tty from 'tty';

import chalk from 'chalk';
import program from 'commander';

import glob from 'glob';

import { createRegistry } from './unit/index';

import { EOL } from 'os'

import { getVSCodeTokens } from './snapshot/index'
import { renderSnap, parseSnap } from './snapshot/parsing'
import { AnnotatedLine, IToken } from './snapshot/model';

// import { inspect } from 'util';
import * as diff from 'diff';

let packageJson = require('../../package.json');

function collectGrammarOpts(value:String, previous:String[]):String[] {
    return previous.concat([value]);
}

program
    .version(packageJson.version)
    .description("Run VSCode textmate grammar snapshot tests")
    .option('-s, --scope <scope>', 'Language scope, e.g. source.dhall')
    .option('-g, --grammar <grammar>', 'Path to a grammar file, either .json or .xml. This option can be specified multiple times if multiple grammar needed.', collectGrammarOpts, [])
    .option('-t, --testcases <glob>', 'A glob pattern which specifies testcases to run, e.g. \"./tests/**/test*.dhall\". Quotes are important!')
    .option("-u, --updateSnapshot", 'overwrite all snap files with new changes')
    .option("--printNotModified", 'include not modified scopes in the output', false)
    .option("--expandDiff", 'produce each diff on two lines prefixed with "++" and "--"', false)
    .parse(process.argv);


if (program.scope === undefined || program.grammar === undefined || program.grammar.length === 0 || program.testcases === undefined) {
    program.help()
}


let isatty = tty.isatty(1) && tty.isatty(2)

const symbols = {
    ok: '✓',
    err: '✖',
    dot: '․',
    comma: ',',
    bang: '!'
};

if (process.platform === 'win32') {
    symbols.ok = '\u221A';
    symbols.err = '\u00D7';
    symbols.dot = '.';
}

let terminalWidth = 75;

if (isatty) {
    terminalWidth = (process.stdout as tty.WriteStream).getWindowSize()[0];
}


const TestFailed = -1
const TestSuccessful = 0
const Padding = "  "


const registry = createRegistry(program.grammar);

glob(program.testcases, (err, files0) => {
    if (err !== null) {
        console.log(chalk.red("ERROR") + " glob pattern is incorrect: '" + chalk.gray(program.testcases) + "'")
        console.log(err)
        process.exit(-1)
    }
    const files = files0.filter(x => !x.endsWith(".snap"))
    if (files.length === 0) {
        console.log(chalk.red("ERROR") + " no test cases found")
        process.exit(-1)
    }
    const testResults: Promise<number[]> = Promise.all(files.map(filename => {
        const src = fs.readFileSync(filename).toString()
        return getVSCodeTokens(registry, program.scope, src)
            .then(tokens => {
                if (fs.existsSync(filename + ".snap")) {
                    if (program.updateSnapshot) {
                        console.log(chalk.yellowBright("Updating snapshot for") + chalk.whiteBright(filename + ".snap"))
                        fs.writeFileSync(filename + ".snap", renderSnap(tokens), 'utf8')
                        return TestSuccessful;
                    } else {
                        const expectedTokens = parseSnap(fs.readFileSync(filename + ".snap").toString())
                        return renderTestResult(filename, expectedTokens, tokens);
                    }
                } else {
                    console.log(chalk.yellowBright("Generating snapshot ") + chalk.whiteBright(filename + ".snap"))
                    fs.writeFileSync(filename + ".snap", renderSnap(tokens))
                    return TestSuccessful;
                }
            })
            .catch(error => {
                console.log(chalk.red("ERROR") + " can't run testcase: " + chalk.whiteBright(filename))
                console.log(error)
                return TestFailed;
            })
    }));

    testResults.then(xs => {
        const result = xs.reduce((a, b) => a + b, 0)
        if (result === TestSuccessful) {
            process.exit(0);
        } else {
            process.exit(-1);
        }
    })

});

function renderTestResult(filename: string, expected: AnnotatedLine[], actual: AnnotatedLine[]): number {



    if (expected.length !== actual.length) {
        console.log(chalk.red("ERROR running testcase ") + chalk.whiteBright(filename) + chalk.red(` snapshot and actual file contain different number of lines.${EOL}`))
        return TestFailed;
    }

    for (let i = 0; i < expected.length; i++) {
        const exp = expected[i];
        const act = actual[i];
        if (exp.src !== act.src) {
            console.log(chalk.red("ERROR running testcase ") + chalk.whiteBright(filename) + chalk.red(` source different snapshot at line ${i + 1}.${EOL} expected: ${exp.src}${EOL} actual: ${act.src}${EOL}`))
            return TestFailed;
        }
    }

    // renderSnap won't produce assertions for empty lines, so we'll remove them here
    // for both actual end expected
    let actual1 = actual.filter(a => a.src.trim().length > 0);
    let expected1 = expected.filter(a => a.src.trim().length > 0);

    const wrongLines = flatten(expected1.map((exp, i) => {
        const act = actual1[i];

        const expTokenMap = toMap(t => `${t.startIndex}:${t.startIndex}`, exp.tokens)
        const actTokenMap = toMap(t => `${t.startIndex}:${t.startIndex}`, act.tokens)




        const removed = exp.tokens.filter(t => actTokenMap[`${t.startIndex}:${t.startIndex}`] === undefined).map(t => {
            return <TChanges>{
                changes: [<TChange>{
                    text: t.scopes.join(" "),
                    changeType: Removed
                }],
                from: t.startIndex,
                to: t.endIndex,

            }
        });
        const added = act.tokens.filter(t => expTokenMap[`${t.startIndex}:${t.startIndex}`] === undefined).map(t => {
            return <TChanges>{
                changes: [<TChange>{
                    text: t.scopes.join(" "),
                    changeType: Added
                }],
                from: t.startIndex,
                to: t.endIndex
            }
        });

        const modified = flatten(act.tokens.map(a => {
            const e = expTokenMap[`${a.startIndex}:${a.startIndex}`]
            if (e !== undefined) {
                const changes = diff.diffArrays(e.scopes, a.scopes)
                if (changes.length === 1 && !changes[0].added && !changes[0].removed) {
                    return []
                }

                const tchanges = changes.map(change => {
                    let changeType = change.added ? Added : (change.removed ? Removed : NotModified);
                    return <TChange>{
                        text: change.value.join(" "),
                        changeType: changeType
                    };
                });
                return [<TChanges>{
                    changes: tchanges,
                    from: a.startIndex,
                    to: a.endIndex
                }]

            } else {
                return [];
            }
        }));

        const allChanges = modified.concat(added).concat(removed).sort((x, y) => (x.from - y.from) * 10000 + (x.to - y.to))
        if (allChanges.length > 0) {
            return [[allChanges, exp.src, i] as [TChanges[], string, number]];
        } else {
            return [];
        }
    }));

    if (wrongLines.length > 0) {
        console.log(chalk.red("ERROR in test case ") + chalk.whiteBright(filename))
        console.log(Padding + Padding + chalk.red("-- existing snapshot"))
        console.log(Padding + Padding + chalk.green("++ new changes"))
        console.log()

        if (program.expandDiff) {
            printDiffOnTwoLines(wrongLines)
        } else {
            printDiffInline(wrongLines)
        }

        console.log();
        return TestFailed;
    } else {
        console.log(chalk.green(symbols.ok) + " " + chalk.whiteBright(filename) + " run successfully.")
        return TestSuccessful;
    }

}

function printDiffInline(wrongLines: [TChanges[], string, number][]) {
    wrongLines.forEach(([changes, src, i]) => {
        const lineNumberOffset = printSourceLine(src, i)
        changes.forEach(tchanges => {
            const change = tchanges.changes.filter(c => program.printNotModified || c.changeType !== NotModified).map(c => {
                let color = c.changeType === Added ? chalk.green : (c.changeType === Removed ? chalk.red : chalk.gray);
                return color(c.text);
            }).join(" ")
            printAccents(lineNumberOffset, tchanges.from, tchanges.to, change)
        })
        console.log();
    });
}

function printDiffOnTwoLines(wrongLines: [TChanges[], string, number][]) {
    wrongLines.forEach(([changes, src, i]) => {
        const lineNumberOffset = printSourceLine(src, i)
        changes.forEach(tchanges => {
            const removed = tchanges.changes.filter(c => c.changeType === Removed || (c.changeType === NotModified && program.printNotModified)).map(c => {
                return chalk.red(c.text);
            }).join(" ")
            const added = tchanges.changes.filter(c => c.changeType === Added || (c.changeType === NotModified && program.printNotModified)).map(c => {
                return chalk.green(c.text);
            }).join(" ")
            printAccents1(lineNumberOffset, tchanges.from, tchanges.to, chalk.red("-- ") + removed, Removed)
            printAccents1(lineNumberOffset, tchanges.from, tchanges.to, chalk.green("++ ") + added, Added)
        })
        console.log();
    });
}

function toMap<T>(f: (x: T) => string, xs: T[]): { [key: string]: T } {
    return xs.reduce((m: { [key: string]: T }, x: T) => {
        m[f(x)] = x;
        return m;
    }, {});
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a === b) { return true };
    if (a === null || b === null) { return false };
    if (a.length !== b.length) { return false };

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) { return false };
    }
    return true;
}

function flatten<T>(arr: T[][]): T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

interface TChanges {
    changes: TChange[]
    from: number
    to: number
}

interface TChange {
    text: string
    changeType: number // 0 - not modified, 1 - removed, 2 - added
}

const NotModified = 0
const Removed = 1
const Added = 2

function printSourceLine(line: String, n: number): number {
    const pos = (n + 1) + ": "

    console.log(Padding + chalk.gray(pos) + line)
    return pos.length
}

function printAccents(offset: number, from: number, to: number, diff: string) {
    const accents = " ".repeat(from) + "^".repeat(to - from)
    console.log(Padding + " ".repeat(offset) + accents + " " + diff)
}

function printAccents1(offset: number, from: number, to: number, diff: string, change: number) {
    let color = change === Added ? chalk.green : (change === Removed ? chalk.red : chalk.gray);
    let prefix = change === Added ? "++" : (change === Removed ? "--" : "  ");
    const accents = color(" ".repeat(from) + "^".repeat(to - from))
    console.log(color(prefix) + " ".repeat(offset) + accents + " " + diff)
}