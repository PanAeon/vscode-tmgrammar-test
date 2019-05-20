# This imports the nix package collection,
# so we can access the `pkgs` and `stdenv` variables
with import <nixpkgs> {};

# Make a new "derivation" that represents our shell
stdenv.mkDerivation {
  name = "node-tmgrammar-test";

  # The packages in the `buildInputs` list will be added to the PATH in our shell
  buildInputs = [
    # see https://nixos.org/nixos/packages.html to search for more
    pkgs.nodejs-10_x coreutils nodePackages_10_x.node-gyp nodePackages_10_x.node-gyp-build nodePackages_10_x.node-pre-gyp nodePackages_10_x.typescript pkgs.python
  ];
}
