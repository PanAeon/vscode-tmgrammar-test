import child_process from 'child_process'
import { expect } from 'chai'
import fs from 'fs'
import util from 'util'

const exec = util.promisify(child_process.exec)

// FIXME: assertions and done()
describe('snap test', () => {
  const root = process.cwd()

  it('should report OK for test without errors', () => {
    return exec(`node ${root}/dist/src/snapshot.js \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/snap-ok-scenario/simple.dhall`, {
      cwd: root
    }).then(({stdout, stderr}) => {
          expect(stdout).to.eq(`✓ ${root}/test/functional/resources/snap-ok-scenario/simple.dhall run successfully.\n`)
          expect(stderr).to.eq('')
    })
  })

  it('should report wrong or missing scopes', () => {
    return exec(`node ${root}/dist/src/snapshot.js  \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/snap-simple-failure/simple.dhall`, {
      cwd: root
    })
    .then(() => {throw new Error('should have failed')})
    .catch(({stdout, stderr}) => {
        // fs.writeFileSync('stderr.txt', stderr)
        //  fs.writeFileSync('stdout.txt', stdout)
      expect(stdout).to.eq(
        fs.readFileSync(`${__dirname}/resources/snap-simple-failure/stdout.txt`).toString().replace(/<root>/, root))
    })
  })

  it('should report update snapshot', async () => {
    fs.copyFileSync(`${__dirname}/resources/snap-update-snapshot/ref.dhall.snap`,
                    `${__dirname}/resources/snap-update-snapshot/simple.dhall.snap`)
    await exec(`node ${root}/dist/src/snapshot.js  \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/snap-update-snapshot/simple.dhall \\
      --updateSnapshot`, {
      cwd: root
    })

    await exec(`node ${root}/dist/src/snapshot.js  \\
      --scope source.dhall \\
      --grammar ${root}/test/resources/dhall.tmLanguage.json \\
      -t ${__dirname}/resources/snap-update-snapshot/simple.dhall`, {
      cwd: root
    }).then(({stdout, stderr}) => {
      expect(stdout).to.eq(`✓ ${root}/test/functional/resources/snap-update-snapshot/simple.dhall run successfully.\n`)
      expect(stderr).to.eq('')
    })
    fs.unlinkSync(`${__dirname}/resources/snap-update-snapshot/simple.dhall.snap`)
  })
})