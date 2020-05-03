import child_process from 'child_process'
import { expect } from 'chai'
import fs from 'fs'
import util from 'util'

const exec = util.promisify(child_process.exec)

// FIXME: assertions and done()
describe('unit test', () => {
  const root = process.cwd()

  it('should report OK for test without errors', () => {
    return exec(`node ${root}/dist/src/unit.js \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/unit-ok-scenario/success.dhall`, {
      cwd: root
    }).then(({stdout, stderr}) => {
          expect(stdout).to.eq(`✓ ${root}/test/functional/resources/unit-ok-scenario/success.dhall run successfuly.\n`)
          expect(stderr).to.eq('')
    })
  })

  it('should report Unexpected scopes', () => {
    return exec(`node ${root}/dist/src/unit.js  \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/unit-report-unexpected-scopes/unexpected.scopes.test.dhall`, {
      cwd: root
    })
    .then(() => {throw new Error('should have failed')})
    .catch(({stdout, stderr}) => {
       // fs.writeFileSync('stderr.txt', stderr)
        // fs.writeFileSync('stdout.text', stdout)
      expect(stdout).to.deep.equal
        (fs.readFileSync(`${__dirname}/resources/unit-report-unexpected-scopes/stdout.txt`).toString().replace(/<root>/g, root))
    })








  })
})