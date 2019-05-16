-- SYNTAX TEST "source.dhall" 
-- simple test


{- Don't repeat yourself!

   Repetition is error-prone
-}


let user = "bill"
in  { home       = "/home/${user}"
-- <~~~~- keyword.operator.record.begin.dhall
    , privateKey = "/home/${user}/id_ed25519xjjjjffffffffffffffjdkfjskfjkdjfjdfjfkdkfjsdkfsdflsfsdflsfjsdkflsdfjsf"
--    ^^^^^^^^^^ source.dhall meta.declaration.data.record.block.dhall  variable.object.property.dhall
--               ^ punctuation.separator.dictionary.key-value.dhall source.dhall
--                 ^^^^^^^^^^^^^^^^^^^^^^^^^^  string.quoted.double.dhall source.dhall
    , publicKey  = "/home/${user}/id_ed25519.pub"
--                        ^^^^^^^ constant.other.placeholder.dhall
--                          ^^^^   meta.label.dhall   
}
-- <- keyword.operator.record.end.dhall meta.declaration.data.record.block.dhall



