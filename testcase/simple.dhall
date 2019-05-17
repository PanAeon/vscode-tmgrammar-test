-- SYNTAX TEST "source.dhall" 

let user = "bill"
--  ^^^^ source.dhall meta.declaration.expression.let.dhall variable.other.constant.dhall
in  { home       = "/home/${user}"
    , privateKey = "/home/${user}/id_ed25519"
    , publicKey  = "/home/${user}/id_ed25519.pub"


}
