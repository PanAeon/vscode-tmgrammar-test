'use strict';
import { expect } from 'chai'

import { missingScopes_ } from '../../src/unit/index'

describe('scopesEqual_', () => {
    it('should return [] on two empty arrays', () => {
        expect(missingScopes_([],[])).to.eql([]);
    });
    it('should return [] on empty requirements array', () => {
        expect(missingScopes_([],['a', 'b', 'c'])).to.eql([]);
    });
    it('should return [] when requirements is a subset of a source array', () => {
        expect(missingScopes_(['b', 'd', 'e'], ['a', 'b', 'c', 'd', 'e', 'f'])).to.eql([]);
    });
    it('should work with duplicate elements', () => {
        expect(missingScopes_(['a', 'b', 'd', 'e'], ['a', 'a', 'a', 'b', 'c', 'd', 'e', 'f'])).to.eql([]);
    });
    it('should work with duplicate elements in requirements', () => {
        expect(missingScopes_(['a', 'a', 'a', 'b', 'd', 'e'], ['a', 'a', 'a', 'b', 'c', 'd', 'e', 'f'])).to.eql([]);
    });
    it('should return [] when elements a bit misaligned', () => {
        expect(missingScopes_(['b', 'c', 'a'], ['a', 'a', 'b', 'c', 'd', 'a', 'a', 'f'])).to.eql([]);
    });
    it('should return missing when actual array is empty', () => {
        expect(missingScopes_(['b', 'c', 'a'], [])).to.eql(['b', 'c', 'a']);
    });
    it('should return missing when the arrays are different', () => {
        expect(missingScopes_(['b', 'e', 'a'], ['b', 'c', 'a'])).to.eql(['e', 'a']);
    });
    it('should return missing when expected contains extra duplicate', () => {
        expect(missingScopes_(['b', 'c', 'a', 'a'], ['b', 'c', 'a'])).to.eql(['a']);
    });
});