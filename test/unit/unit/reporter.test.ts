'use strict'
import { expect } from 'chai'
import * as fs from 'fs'
import * as p from 'path'
import { parseStringPromise } from 'xml2js'

import { XunitReporter } from '../../../src/unit/reporter'
import { GrammarTestCase, LineAssertion, TestCaseMetadata, TestFailure } from '../../../src/unit/model'

describe('XUnit reporter', () => {

    function metadata(description?: string): TestCaseMetadata {
        return {
            scope: 'main.scope',
            commentToken: '//',
            description: description || "",
            allowMiddleLineAssertions: true
        }
    }

    function lineAssertion(sourceLineNumber: number, testCaseLineNumber?: number): LineAssertion {
        return {
            sourceLineNumber: sourceLineNumber - 1,
            testCaseLineNumber: testCaseLineNumber
                ? testCaseLineNumber - 1
                : sourceLineNumber,
            scopeAssertions: [{
                from: 1, to: 2, scopes: ['scope1'], exclude: []
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
            srcLine: sourceLineNumber - 1,
            line: testCaseLineNumber - 1,
            start, end
        }
    }

    let reportsDir: string
    let reporter: XunitReporter

    beforeEach(() => {
        reportsDir = fs.mkdtempSync("/tmp/reports_")
        reporter = new XunitReporter(reportsDir)
    })

    afterEach(() => {
        fs.rmdirSync(reportsDir, { recursive: true })
    })

    it('should emit one report file per test file', async () => {
        reporter.reportTestResult('file1', {
            source: ['source1'],
            metadata: metadata('case 1 description'),
            assertions: [
                lineAssertion(71),
                lineAssertion(82),
            ]
        }, [])
        reporter.reportTestResult('file2', {
            source: ['source2'],
            metadata: metadata(),
            assertions: [
                lineAssertion(93),
            ]
        }, [])
        reporter.reportSuiteResult()

        const reportFiles = fs.readdirSync(reportsDir)
        expect(reportFiles)
            .members([
                'TEST-file1.xml',
                'TEST-file2.xml'
            ])
            .length(2)

        const xml1 = await readReport('TEST-file1.xml')
        expect(xml1.testsuite.$.name).eq('case 1 description')
        expect(xml1.testsuite.$.tests).eq('2')
        expect(xml1.testsuite.$.failures).eq('0')
        expect(xml1.testsuite.testcase).length(2)
        expect(xml1.testsuite.testcase[0].$.name).eq('file1:71')
        expect(xml1.testsuite.testcase[1].$.name).eq('file1:82')

        const xml2 = await readReport('TEST-file2.xml')
        expect(xml2.testsuite.$.name).eq('file2')
        expect(xml2.testsuite.$.tests).eq('1')
        expect(xml2.testsuite.$.failures).eq('0')
        expect(xml2.testsuite.testcase).length(1)
        expect(xml2.testsuite.testcase[0].$.name).eq('file2:93')
    })

    it('should place reports for test files in nested directories directly into reports directory with mangled names', async () => {
        reporter.reportTestResult('file1', {
            source: ['source1'],
            metadata: metadata(),
            assertions: [lineAssertion(10)]
        }, [])
        reporter.reportTestResult('dir1/file2', {
            source: ['source2'],
            metadata: metadata("case 2 description"),
            assertions: [lineAssertion(20)]
        }, [])
        reporter.reportTestResult('dir1/dir2/file3', {
            source: ['source3'],
            metadata: metadata(),
            assertions: [lineAssertion(30)]
        }, [])
        reporter.reportSuiteResult()

        const reportFiles = fs.readdirSync(reportsDir)
        expect(reportFiles)
            .members([
                'TEST-file1.xml',
                'TEST-dir1.file2.xml',
                'TEST-dir1.dir2.file3.xml',
            ])
            .length(3)

        const xml1 = await readReport('TEST-file1.xml')
        expect(xml1.testsuite.$.name).eq('file1')
        expect(xml1.testsuite.testcase[0].$.name).eq('file1:10')

        const xml2 = await readReport('TEST-dir1.file2.xml')
        expect(xml2.testsuite.$.name).eq('case 2 description')
        expect(xml2.testsuite.testcase[0].$.name).eq('dir1/file2:20')

        const xml3 = await readReport('TEST-dir1.dir2.file3.xml')
        expect(xml3.testsuite.$.name).eq('dir1/dir2/file3')
        expect(xml3.testsuite.testcase[0].$.name).eq('dir1/dir2/file3:30')
    })

    it('should escape reserved characters in failure description', async () => {
        reporter.reportTestResult('file', {
            source: [
                'xml hell " \' < > &',
                'assertion',
            ],
            metadata: metadata(),
            assertions: [
                lineAssertion(1)
            ]
        }, [
            assertionFailure(1, 2, 0, 1, [], ['m1'], []),
        ])
        reporter.reportSuiteResult()

        const xml = await readReport('TEST-file.xml')
        expect(xml.testsuite.testcase[0].failure[0]._).eq([
            '  2: xml hell " \' < > &', // the escapes were converted back to regular chars by the xml lib when parsing
            '     ^',
            '  missing required scopes: m1',
            '  actual: ',
        ].join("\n"))
    })

    it('should associate failures with assertions', async () => {
        reporter.reportTestResult('file', {
            source: [
                '1  source1',
                '2  assertion1',
                '3  assertion2',
                '4  source2',
                '5  assertion3',
                '6  source3',
                '7  assertion4',
                '8  assertion5',
                '9  source4',
                '10 assertion6',
            ],
            metadata: metadata(),
            assertions: [
                lineAssertion(1, 2),
                lineAssertion(1, 3),
                lineAssertion(4, 5),
                lineAssertion(6, 7),
                lineAssertion(6, 8),
                lineAssertion(9, 10),
            ]
        }, [
            assertionFailure(1, 3, 0, 1, ['a1', 'a2', 'a3'], ['m1', 'm2'], ['u1']),
            assertionFailure(6, 7, 0, 3, ['a1', 'a2'], ['m1'], []),
            assertionFailure(6, 8, 3, 5, ['a1'], [], ['u1']),
        ])
        reporter.reportSuiteResult()

        const reportFiles = fs.readdirSync(reportsDir)
        expect(reportFiles)
            .members([
                'TEST-file.xml',
            ])
            .length(1)

        const xml = await readReport('TEST-file.xml')
        expect(xml.testsuite.$.tests).eq('4')
        expect(xml.testsuite.$.failures).eq('3')
        expect(xml.testsuite.testcase).length(4)

        const [xmlCase1, xmlCase2, xmlCase3, xmlCase4] = xml.testsuite.testcase

        expect(xmlCase1.$.name).eq('file:1')
        expect(xmlCase1.failure).length(1)
        const [xmlFailure11] = xmlCase1.failure
        expect(xmlFailure11.$.message).eq("Assertion failed at 3:1:2")
        expect(xmlFailure11._).eq([
            '  3: 1  source1',
            '     ^',
            '  missing required scopes: m1 m2',
            '  prohibited scopes: u1',
            '  actual: a1 a2 a3',
        ].join("\n"))

        expect(xmlCase2.$.name).eq('file:4')
        expect(xmlCase2.failure).is.undefined

        expect(xmlCase3.$.name).eq('file:6')
        expect(xmlCase3.failure).length(2)
        const [xmlFailure31, xmlFailure32] = xmlCase3.failure
        expect(xmlFailure31.$.message).eq("Assertion failed at 7:1:4")
        expect(xmlFailure31._).eq([
            '  7: 6  source3',
            '     ^^^',
            '  missing required scopes: m1',
            '  actual: a1 a2',
        ].join("\n"))
        expect(xmlFailure32.$.message).eq("Assertion failed at 8:4:6")
        expect(xmlFailure32._).eq([
            '  8: 6  source3',
            '        ^^',
            '  prohibited scopes: u1',
            '  actual: a1',
        ].join("\n"))

        expect(xmlCase4.$.name).eq('file:9')
        expect(xmlCase4.failure).is.undefined
    })

    const readReport: (filename: string) => any = async (filename: string) => {
        return await parseStringPromise(fs.readFileSync(p.resolve(reportsDir, filename)))
    }
})

