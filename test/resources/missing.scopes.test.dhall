-- SYNTAX TEST "source.dhall" 
-- simple test


{- Don't repeat yourself!

   Repetition is error-prone
-}


let user = "bill"
in  { home       = "/home/${user}"
-- <~~~~- m1 keyword.operator.record.begin.dhall m2.foo
    , privateKey = "/home/${user}/id_ed25519"
--    ^^^^^^^^^^ source.dhall meta.declaration.data.record.block.dhall  m3.foo variable.object.property.dhall
--               ^ m4.foo
--                 ^^^^^^^^^^^^^^^^^^^^^^^^^^ source.dhall string.quoted.double.dhall m5.foo
    , publicKey  = "/home/${user}/id_ed25519.pub"
--                        ^^^^^^^ constant.other.placeholder.dhall
--                          ^^^^   meta.label.dhall   
}
-- <- keyword.operator.record.end.dhall m6.foo




