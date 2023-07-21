'use strict'
import { expect } from 'chai'
import * as fs from 'fs'
import * as p from 'path'
import { parseStringPromise } from 'xml2js'

import { Reporter, XunitGenericReporter, XunitGitlabReporter } from '../../../src/unit/reporter'
import { LineAssertion, TestCaseMetadata, TestFailure } from '../../../src/unit/model'

describe('XUnit reporters', () => {

    let reportsDir: string

    beforeEach(() => {
        reportsDir = fs.mkdtempSync("/tmp/reports_")
    })

    afterEach(() => {
        fs.rmdirSync(reportsDir, { recursive: true })
    })

    describe('Generic XUnit reporter', () => {

        let reporter: Reporter

        beforeEach(() => {
            reporter = new XunitGenericReporter(reportsDir)
        })

        it('should emit one report file per test file', async () => {
            reporter.reportTestResult('file1', {
                source: ['source1'],
                metadata: metadata('case 1 description'),
                assertions: [
                    lineAssertion(0, 1),
                    lineAssertion(0, 2),
                ]
            }, [])
            reporter.reportTestResult('file2', {
                source: ['source2'],
                metadata: metadata(),
                assertions: [
                    lineAssertion(0, 3),
                ]
            }, [])
            reporter.reportSuiteResult()

            assertReportFiles(
                'TEST-file1.xml',
                'TEST-file2.xml'
            )

            const xml1 = await readReport('TEST-file1.xml')
            expect(xml1.testsuite.$.name).eq('case 1 description')
            expect(xml1.testsuite.$.tests).eq('2')
            expect(xml1.testsuite.$.failures).eq('0')
            expect(xml1.testsuite.testcase).length(2)
            expect(xml1.testsuite.testcase[0].$.name).eq('file1:1')
            expect(xml1.testsuite.testcase[1].$.name).eq('file1:2')

            const xml2 = await readReport('TEST-file2.xml')
            expect(xml2.testsuite.$.name).eq('file2')
            expect(xml2.testsuite.$.tests).eq('1')
            expect(xml2.testsuite.$.failures).eq('0')
            expect(xml2.testsuite.testcase).length(1)
            expect(xml2.testsuite.testcase[0].$.name).eq('file2:3')
        })

        it('should place reports for test files in nested directories directly into reports directory with mangled names', async () => {
            reporter.reportTestResult('file1', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 1)]
            }, [])
            reporter.reportTestResult('dir1/file2', {
                source: ['source2'],
                metadata: metadata("case 2 description"),
                assertions: [lineAssertion(0, 2)]
            }, [])
            reporter.reportTestResult('dir1/dir2/file3', {
                source: ['source3'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 3)]
            }, [])
            reporter.reportSuiteResult()

            assertReportFiles(
                'TEST-file1.xml',
                'TEST-dir1.file2.xml',
                'TEST-dir1.dir2.file3.xml',
            )

            const xml1 = await readReport('TEST-file1.xml')
            expect(xml1.testsuite.$.name).eq('file1')
            expect(xml1.testsuite.testcase[0].$.name).eq('file1:1')

            const xml2 = await readReport('TEST-dir1.file2.xml')
            expect(xml2.testsuite.$.name).eq('case 2 description')
            expect(xml2.testsuite.testcase[0].$.name).eq('dir1/file2:2')

            const xml3 = await readReport('TEST-dir1.dir2.file3.xml')
            expect(xml3.testsuite.$.name).eq('dir1/dir2/file3')
            expect(xml3.testsuite.testcase[0].$.name).eq('dir1/dir2/file3:3')
        })

        it('should escape reserved characters in failure description', async () => {
            reporter.reportTestResult('file', {
                source: [
                    'xml hell " \' < > &',
                    // 'assertion',
                ],
                metadata: metadata(),
                assertions: [
                    lineAssertion(0, 1)
                ]
            }, [
                assertionFailure(0, 1, 0, 1, [], ['m1'], []),
            ])
            reporter.reportSuiteResult()

            const xml = await readReport('TEST-file.xml')
            expect(xml.testsuite.testcase[0].failure[0]._).eq([
                '1: xml hell " \' < > &', // the escapes were converted back to regular chars by the xml lib when parsing
                '   ^',
                'missing required scopes: m1',
                'actual: ',
            ].join("\n"))
        })

        it('should associate assertion failures with source lines', async () => {
            reporter.reportTestResult('file', {
                source: [
                    /*0*/'1  source1',
                    //   '2  assertion1',
                    //   '3  assertion2',
                    /*1*/'4  source2',
                    //   '5  assertion3',
                    /*2*/'6  source3',
                    //   '7  assertion4',
                    //   '8  assertion5',
                    /*3*/'9  source4',
                    //   '10 assertion6',
                ],
                metadata: metadata(),
                assertions: [
                    lineAssertion(0, 1),
                    lineAssertion(1, 4),
                    lineAssertion(2, 6),
                    lineAssertion(3, 9),
                ]
            }, [
                assertionFailure(0, 1, 0, 1, ['a1', 'a2', 'a3'], ['m1', 'm2'], ['u1']),
                assertionFailure(2, 6, 0, 3, ['a1', 'a2'], ['m1'], []),
                assertionFailure(2, 6, 3, 5, ['a1'], [], ['u1']),
            ])
            reporter.reportSuiteResult()

            assertReportFiles('TEST-file.xml')

            const xml = await readReport('TEST-file.xml')
            expect(xml.testsuite.$.tests).eq('4')
            expect(xml.testsuite.$.failures).eq('3')
            expect(xml.testsuite.testcase).length(4)

            const [xmlCase1, xmlCase2, xmlCase3, xmlCase4] = xml.testsuite.testcase

            expect(xmlCase1.$.name).eq('file:1')
            expect(xmlCase1.failure).length(1)
            const [xmlFailure11] = xmlCase1.failure
            expect(xmlFailure11.$.message).eq("Assertion failed at 1:1:2")
            expect(xmlFailure11._).eq([
                '1: 1  source1',
                '   ^',
                'missing required scopes: m1 m2',
                'prohibited scopes: u1',
                'actual: a1 a2 a3',
            ].join("\n"))

            expect(xmlCase2.$.name).eq('file:4')
            expect(xmlCase2.failure).is.undefined

            expect(xmlCase3.$.name).eq('file:6')
            expect(xmlCase3.failure).length(2)
            const [xmlFailure31, xmlFailure32] = xmlCase3.failure
            expect(xmlFailure31.$.message).eq("Assertion failed at 6:1:4")
            expect(xmlFailure31._).eq([
                '6: 6  source3',
                '   ^^^',
                'missing required scopes: m1',
                'actual: a1 a2',
            ].join("\n"))
            expect(xmlFailure32.$.message).eq("Assertion failed at 6:4:6")
            expect(xmlFailure32._).eq([
                '6: 6  source3',
                '      ^^',
                'prohibited scopes: u1',
                'actual: a1',
            ].join("\n"))

            expect(xmlCase4.$.name).eq('file:9')
            expect(xmlCase4.failure).is.undefined
        })

        it('should create report for test file which fails to parse', async () => {
            reporter.reportTestResult('file1', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 1)]
            }, [])
            reporter.reportParseError('file2', new Error(
                'Expecting the first line in the syntax test file to be in the following format:\n' +
                '<comment character(s)> SYNTAX TEST "<language identifier>"  ("description")?\n'))
            reporter.reportTestResult('file3', {
                source: ['source3'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 3)]
            }, [])
            reporter.reportSuiteResult()

            assertReportFiles(
                'TEST-file1.xml',
                'TEST-file2.xml',
                'TEST-file3.xml',
            )

            const xml = await readReport('TEST-file2.xml')
            expect(xml.testsuite.$.tests).eq('1')
            expect(xml.testsuite.$.failures).eq('0')
            expect(xml.testsuite.$.errors).eq('1')
            expect(xml.testsuite.testcase).length(1)

            const xmlCase = xml.testsuite.testcase[0]
            expect(xmlCase.$.name).eq('Parse test file')
            expect(xmlCase.failure).is.undefined
            expect(xmlCase.error).length(1)
            expect(xmlCase.error[0].$.message).eq("Failed to parse test file")
            expect(xmlCase.error[0]._).satisfy((m: string) => m.startsWith([
                'Error: Expecting the first line in the syntax test file to be in the following format:',
                '<comment character(s)> SYNTAX TEST "<language identifier>"  ("description")?',
            ].join("\n")))
        })

        it('should create report for test file which errors when running grammar test', async () => {
            reporter.reportTestResult('file1', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 1)]
            }, [])
            reporter.reportGrammarTestError('file2', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 2)]
            }, new Error('No grammar provided for <foobar>'))
            reporter.reportTestResult('file3', {
                source: ['source3'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 3)]
            }, [])
            reporter.reportSuiteResult()

            assertReportFiles(
                'TEST-file1.xml',
                'TEST-file2.xml',
                'TEST-file3.xml',
            )

            const xml = await readReport('TEST-file2.xml')
            expect(xml.testsuite.$.tests).eq('1')
            expect(xml.testsuite.$.failures).eq('0')
            expect(xml.testsuite.$.errors).eq('1')
            expect(xml.testsuite.testcase).length(1)

            const xmlCase = xml.testsuite.testcase[0]
            expect(xmlCase.$.name).eq('Run grammar tests')
            expect(xmlCase.failure).is.undefined
            expect(xmlCase.error).length(1)
            expect(xmlCase.error[0].$.message).eq("Error when running grammar tests")
            expect(xmlCase.error[0]._).satisfy((m: string) => m.startsWith([
                'Error: No grammar provided for <foobar>',
            ].join("\n")))
        })
    })

    describe('GitLab-flavored XUnit reporter', () => {

        let reporter: Reporter

        beforeEach(() => {
            reporter = new XunitGitlabReporter(reportsDir)
        })

        it('should always put filename into classname', async () => {
            reporter.reportTestResult('file1', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 1)]
            }, [])
            reporter.reportGrammarTestError('file2', {
                source: ['source1'],
                metadata: metadata(),
                assertions: [lineAssertion(0, 2)]
            }, new Error('No grammar provided for <foobar>'))
            reporter.reportParseError('file3', new Error(
                'Expecting the first line in the syntax test file to be in the following format:\n' +
                '<comment character(s)> SYNTAX TEST "<language identifier>"  ("description")?\n'))
            reporter.reportSuiteResult()

            const xml1 = await readReport('TEST-file1.xml')
            expect(xml1.testsuite.testcase[0].$.classname).eq('file1')

            const xml2 = await readReport('TEST-file2.xml')
            expect(xml2.testsuite.testcase[0].$.classname).eq('file2')

            const xml3 = await readReport('TEST-file3.xml')
            expect(xml3.testsuite.testcase[0].$.classname).eq('file3')
        })

        it('should put all failed assertions for one source line into single failure', async () => {
            reporter.reportTestResult('file', {
                source: [
                    /*0*/'1  source1',
                    //   '2  assertion1',
                    //   '3  assertion2',
                    /*1*/'4  source2',
                    //   '5  assertion3',
                    /*2*/'6  source3',
                    //   '7  assertion4',
                    //   '8  assertion5',
                    /*3*/'9  source4',
                    // '10 assertion6',
                ],
                metadata: metadata(),
                assertions: [
                    lineAssertion(0, 1),
                    lineAssertion(1, 4),
                    lineAssertion(2, 6),
                    lineAssertion(3, 9),
                ]
            }, [
                assertionFailure(0, 1, 0, 1, ['a1', 'a2', 'a3'], ['m1', 'm2'], ['u1']),
                assertionFailure(2, 6, 0, 3, ['a1', 'a2'], ['m1'], []),
                assertionFailure(2, 6, 3, 5, ['a1'], [], ['u1']),
            ])
            reporter.reportSuiteResult()

            assertReportFiles('TEST-file.xml')

            const xml = await readReport('TEST-file.xml')
            expect(xml.testsuite.$.tests).eq('4')
            expect(xml.testsuite.$.failures).eq('2')
            expect(xml.testsuite.testcase).length(4)

            const [xmlCase1, xmlCase2, xmlCase3, xmlCase4] = xml.testsuite.testcase

            expect(xmlCase1.$.name).eq('file:1')
            expect(xmlCase1.failure).length(1)
            const [xmlFailure1] = xmlCase1.failure
            expect(xmlFailure1.$.message).eq("Failed at soure line 1")
            expect(xmlFailure1._).eq([
                'at [file:1:1:2]:',
                '1: 1  source1',
                '   ^',
                'missing required scopes: m1 m2',
                'prohibited scopes: u1',
                'actual: a1 a2 a3',
                ''
            ].join("\n"))

            expect(xmlCase2.$.name).eq('file:4')
            expect(xmlCase2.failure).is.undefined

            expect(xmlCase3.$.name).eq('file:6')
            expect(xmlCase3.failure).length(1)
            const [xmlFailure3] = xmlCase3.failure
            expect(xmlFailure3.$.message).eq("Failed at soure line 6")
            expect(xmlFailure3._).eq([
                'at [file:6:1:4]:',
                '6: 6  source3',
                '   ^^^',
                'missing required scopes: m1',
                'actual: a1 a2',
                '',
                'at [file:6:4:6]:',
                '6: 6  source3',
                '      ^^',
                'prohibited scopes: u1',
                'actual: a1',
                ''
            ].join("\n"))

            expect(xmlCase4.$.name).eq('file:9')
            expect(xmlCase4.failure).is.undefined
        })
    })

    const assertReportFiles: (...expected: string[]) => void = (...expected: string[]) => {
        const reportFiles = fs.readdirSync(reportsDir)
        expect(reportFiles)
            .members(expected)
            .length(expected.length)
    }

    const readReport: (filename: string) => any = async (filename: string) => {
        return await parseStringPromise(fs.readFileSync(p.resolve(reportsDir, filename)))
    }
})

function metadata(description?: string): TestCaseMetadata {
    return {
        scope: 'main.scope',
        commentToken: '//',
        description: description || "",
        allowMiddleLineAssertions: true
    }
}

function lineAssertion(sourceLineNumber: number, testCaseLineNumber: number): LineAssertion {
    return {
        sourceLineNumber,
        testCaseLineNumber: testCaseLineNumber - 1,
        scopeAssertions: [{
            from: -1, to: -2, scopes: ['scope1'], exclude: []
        }]
    }
}

function assertionFailure(
    sourceLineNumber: number, testCaseLineNumber: number,
    start: number, end: number,
    actual: string[], missing: string[], unexpected: string[],
): TestFailure {
    return {
        actual, missing, unexpected,
        srcLine: sourceLineNumber,
        line: testCaseLineNumber - 1,
        start, end
    }
}
