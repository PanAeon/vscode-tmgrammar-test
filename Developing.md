# Testing

Any contributions are really appreciated! :) Just make sure that all existing tests work, or if they have changed the
change is meaningful.

0. `npm run build`
1. `npm run test`

2. Manually:

```
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/multiple.groups.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/misplaced.scopes.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/out.of.bounds.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/s.parser.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/simple.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/successful.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/unexpected.scopes.test.dhall
node ./dist/src/unit.js --scope source.dhall --grammar ./test/resources/dhall.tmLanguage.json -t ./test/resources/misplaced.scopes.test.dhall

node dist/src/snapshot.js  --scope source.dhall -g ./test/resources/dhall.tmLanguage.json -t ./test/resources/snaps/simple.dhall
node dist/src/snapshot.js  --scope source.dhall -g ./test/resources/dhall.tmLanguage.json -t ./test/resources/snaps/simple.dhall -u
```

## Packaging:
```
npm run build
npm version patch
npm pack
npm publish
```