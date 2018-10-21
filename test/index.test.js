const { expect } = require('chai');
const mova = require('../src');
const preCompile = require('../src/preCompile');

const language = {
  k1: 'v1',
  b1: {
    '@root': 'root <=key1>',
    '@any': 'fallback',
    k1: 'b1-v1',
    k2: '<.> <=key2> b1-v2',
    b2: {
      k1: 'b2-v1',
    },
  },
  b3: {
    k1: 'b3-v1',
  },
};

beforeEach(() => {
  mova.setLanguage(language);
});

describe('mova tests', () => {
  it('should throw an error if language pack is not defined', () => {
    delete mova.language;
    expect(mova).to.throw('');
  });

  it('should return empty string for no path', () => {
    expect(mova()).to.equal('');
  });

  it('should return passed path string for not existed path', () => {
    expect(mova('not', 'existed.path')).to.equal('not.existed.path');
  });

  it('should return passed path string for path to branch with no @root or @any directives', () => {
    expect(mova('b3')).to.equal('b3');
  });

  it('should accept multi args path building', () => {
    expect(mova('.', 'b1', ['b2.k1'])).to.equal('b2-v1');
  });

  it('should ignore any args that are not strings or arrays for path building', () => {
    expect(mova('.', undefined, null, NaN, ['b1'], () => {}, 10, {})).to.equal('root -');
  });

  it('should return value by path', () => {
    expect(mova('b1.k1')).to.equal('b1-v1');
  });

  it('should interpolate value with passed params', () => {
    const params = {
      key1: 'key1-value',
      key2: 10,
    };

    expect(mova('b1', 'k2', params))
      .to.equal(`root ${params.key1} ${params.key2} b1-v2`);
  });

  it('should replace non interpolated keys with interpolationFallback', () => {
    const params = {
      key1: 'key1-value',
    };

    expect(mova('b1', 'k2', params))
      .to.equal(`root ${params.key1} ${mova.interpolationFallback} b1-v2`);
  });

  describe('setLanguage method', () => {
    it('should pre-compile passed language and set it to language attr', () => {
      mova.language = {};
      mova.setLanguage(language);
      expect(mova.language).to.deep.equal(preCompile(language));
    });
  });

  describe('nameSpace method', () => {
    it('should return function', () => {
      expect(mova.nameSpace()).to.be.instanceOf(Function);
    });

    it('ns function should return value searched in its root', () => {
      const t = mova.nameSpace('b1');
      expect(t('k1')).to.equal('b1-v1');
    });

    it('ns function should be able to resolve @root directive', () => {
      const t = mova.nameSpace('b1');
      expect(t()).to.equal('root -');
    });
  });
});
