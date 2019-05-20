
// console.log(inspect(parseGrammarTestCase(loadFile()), false, 5, true));



// (async () => {
//     function loadFile(filename:string): string {
//         return fs.readFileSync(filename).toString();
//     }
//     try {   
//         var registry = createRegistry({
//             'source.dhall': './test/resources/dhall.tmLanguage.json'
//         });
//         // var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/parser.test.dhall")));
//         // var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/missing.scopes.test.dhall")));
//         // var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/unexpected.scopes.test.dhall")));
//         var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/misplaced.scopes.test.dhall")));
//         // var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/successful.test.dhall")));
//         // var failures = await runGrammarTestCase(registry, parseGrammarTestCase(loadFile("./test/resources/out.of.bounds.test.dhall")));
//         console.log(inspect(failures, false, 4, true));
//         console.log("great success!!")
//     } catch (e) {
//         console.log(e);
//         throw e;
//         // Deal with the fact the chain failed
//     }
// })();



// Load the JavaScript grammar and any other grammars included by it async.
// registry.loadGrammar('source.dhall').then((grammar:tm.IGrammar) => {
//     // at this point `grammar` is available...
//     let prevState1: tm.StackElement = <any>null;

// 	var lineTokens = grammar.tokenizeLine('{ privateKey = "/home/${user}/id_ed25519" }', prevState1);
// 	for (var i = 0; i < lineTokens.tokens.length; i++) {
// 		var token = lineTokens.tokens[i];
// 		console.log('Token from ' + token.startIndex + ' to ' + token.endIndex + ' with scopes ' + token.scopes);
// 	}
// });