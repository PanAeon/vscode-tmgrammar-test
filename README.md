## VSCode Textmate grammar test

Provides a way to test textmate grammars against a vscode engine using user-friendly plaintext files.

![Failed test](images/test.failed2.png?raw=true "missed some scopes")


Inspired by [Sublime Text syntax tests](https://www.sublimetext.com/docs/3/syntax.html#testing)

### Setup
```bash
npm install -g vscode-tmgrammar-test
vscode-tmgrammar-test --help
```
### Test cases

```dhall
-- SYNTAX TEST "source.dhall" "optional description"

let user = "bill" 
--        ^ - string.quoted.double.dhall 
--               ^ - string.quoted.double.dhall
in  { home       = "/home/${user}"
-- <~~~~- keyword.operator.record.begin.dhall - foo
    , privateKey = "/home/${user}/id_ed25519"
--    ^^^^^^^^^^ source.dhall meta.declaration.data.record.block.dhall  variable.object.property.dhall
--               ^ source.dhall meta.declaration.data.record.block.dhall meta.declaration.data.record.literal.dhall punctuation.separator.dictionary.key-value.dhall
--                 ^^^^^^^^^^^^^^^^^^^^^^^^^^ source.dhall string.quoted.double.dhall
    , publicKey  = "/home/${user}/id_ed25519.pub"
--                        ^^^^^^^ constant.other.placeholder.dhall
--                          ^^^^   meta.label.dhall   
}
-- <- keyword.operator.record.end.dhall
 -- comment
-- <~- comment.line.double-dash.dhall - meta.declaration.data.record.block.dhall
```

Each test case starts with a header line:
`<comment token> SYNTAX TEST "<language scope>" "optional description"`

You can require tokens to have specific scope by using either `^` or `<-` on the lines
which starts with `<comment token>` below a target line:
*    `^^^` scope1 scope2 ...  will require all tokens above the accents to have specified scopes.
*    `^^` ... `-` scope1 scope2 ... will prohibit tokens above the `^` to have any of specified scopes
*    `<--` scopes.. will match from the beginning of the string. The number of character matched is the number of dashes in the arrow.
*    `<~~-` scopes... same as above but will be offset by the number of `~` characters. Might be useful if `comment token` has got more then one character

Any lines which start with `comment token` will be ignored by the textmate grammar.

### Command Line
```
Usage: vscode-tmgrammar-test [options]

Run Textmate grammar test cases using vscode-textmate

Options:
  -V, --version            output the version number
  -s, --scope <scope>      Language scope, e.g. source.dhall
  -g, --grammar <grammar>  Path to a grammar file, either .json or .xml
  -t, --testcases <glob>   A glob pattern which specifies testcases to run, e.g. './tests/**/test*.dhall'. Quotes are important!
  -c, --compact            Display output in the compact format, which is easier to use with VSCode problem matchers
  -h, --help               output usage information
```
  
for example:

```bash
> vscode-tmgrammar-test -s source.dhall -g testcase/dhall.tmLanguage.json -t '**/*.dhall'
```

### Setup VSCode task

You can setup a vscode test task for convenience:

```json
{
            "label": "Run tests",
            "type": "shell",
            "command": "vscode-tmgrammar-test -c -s source.dhall -g testcase/dhall.tmLanguage.json -t '**/*.dhall'",
            "group": "test",
            "presentation": {
                "reveal": "always",
                "panel":"new"
            },
            "problemMatcher": {
                "fileLocation": [
                    "relative",
                    "${workspaceFolder}"
                ],
                "pattern": [
                    {
                        //ERROR testcase/missing.scopes.test.dhall:14:27:29 Missing required scopes: [ m5.foo ]
                        "regexp": "^(ERROR)\\s([^:]+):(\\d+):(\\d+):(\\d+)\\s(.*)$",
                        "severity": 1,
                        "file": 2,
                        "line": 3,
                        "column": 4,
                        "endColumn": 5,
                        "message": 6
                        
                    }
                ]
            }
        }
```

Notice the `-c` option that will output messages in a convenient format for the problemMatcher.

Result:

![Error in the editor](images/error.in.editor.png?raw=true "Error in the editor")

