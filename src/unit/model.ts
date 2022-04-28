export interface TestCaseMetadata {
  commentToken: string
  scope: string
  description: string
  allowMiddleLineAssertions: boolean
}

export interface ScopeAssertion {
  from: number // note the 0 index
  to: number // exclusive
  scopes: string[]
  exclude: string[]
}

export interface LineAssertion {
  testCaseLineNumber: number
  sourceLineNumber: number
  scopeAssertions: ScopeAssertion[]
}

export interface GrammarTestCase {
  metadata: TestCaseMetadata
  source: string[]
  assertions: LineAssertion[]
}

export interface TestFailure {
  missing: string[]
  actual: string[]
  unexpected: string[]
  line: number
  srcLine: number
  start: number
  end: number
}
