# Testing

Any contributions are really appreciated! :) Just make sure that all existing tests work, or if they have changed the
change is meaningful.

0. `npm run build`
1. `npm run test`

2. Manually:

```
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/multiple.groups.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/misplaced.scopes.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/out.of.bounds.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/s.parser.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/simple.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/successful.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/unexpected.scopes.test.dhall
node ./dist/unit.js --grammar ./test/resources/dhall.tmLanguage.json  ./test/resources/misplaced.scopes.test.dhall

node ./dist/snapshot.js  --scope source.dhall -g ./test/resources/dhall.tmLanguage.json  ./test/resources/snaps/simple.dhall

```

## Packaging:
```
npm run build
npm version patch
npm pack
npm publish
```