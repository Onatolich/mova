const { expect } = require('chai');
const preCompile = require('../src/preCompile');

describe('preCompile tests', () => {
  describe('@root directive', () => {
    it('should correctly resolve @root directory', () => {
      const result = preCompile({
        '@root': 'root',
        b1: {
          '@root': 'b1.root',
        },
      });

      expect(result).to.deep.equal({
        '': 'root',
        b1: 'b1.root',
      });
    });
  });

  describe('@extends directive', () => {
    it('should throw an error if trying to extend non object value', () => {
      const brokenLang = {
        k1: 'v1',
        b1: {
          '@extends': 'k1',
        },
      };

      expect(preCompile.bind(undefined, brokenLang))
        .to.throw('Path k1 can not be extended as its value is not an object!');
    });

    it('should throw an error if trying to extend not existed value', () => {
      const brokenLang = {
        b1: {
          '@extends': 'k1',
        },
      };

      expect(preCompile.bind(undefined, brokenLang))
        .to.throw('Path k1 can not be extended as its value is not an object!');
    });

    it('should correctly extends branches in language pack', () => {
      const result = preCompile({
        b1: {
          '@root': 'root',
          '@any': 'fallback',
          k1: 'v1',
        },
        b2: {
          '@extends': 'b1',
          '@root': 'root2',
        },
        b3: {
          '@extends': 'b2',
          k1: 'v3',
        },
      });

      expect(result).to.deep.equal({
        'b1': 'root',
        'b1.@any': 'fallback',
        'b1.k1': 'v1',
        'b2': 'root2',
        'b2.@any': 'fallback',
        'b2.k1': 'v1',
        'b3': 'root2',
        'b3.@any': 'fallback',
        'b3.k1': 'v3',
      });
    });

    it('should allow multiple inheritance', () => {
      const result = preCompile({
        b1: {
          k1: 'v1',
        },
        b2: {
          k2: 'v2',
        },
        b3: {
          '@extends': 'b1, b2',
        },
      });

      expect(result).to.deep.equal({
        'b1.k1': 'v1',
        'b2.k2': 'v2',
        'b3.k1': 'v1',
        'b3.k2': 'v2',
      });
    });
  });

  describe('In-value <[path]> directives', () => {
    it('should resolve absolute <[path]> directives', () => {
      const result = preCompile({
        b1: {
          '@root': 'root',
          '@any': 'fallback',
          k1: 'v1',
        },
        b2: {
          k2: '<b1.k1> v2',
          k3: '<b1> v3',
          k4: '<b1.wrong.key> v4',
        },
      });

      expect(result).to.deep.equal({
        'b1': 'root',
        'b1.@any': 'fallback',
        'b1.k1': 'v1',
        'b2.k2': 'v1 v2',
        'b2.k3': 'root v3',
        'b2.k4': 'fallback v4',
      });
    });

    it('should resolve relative <[path]> directives', () => {
      const result = preCompile({
        b1: {
          '@root': 'root',
          '@any': 'fallback',
          k1: 'v1',
          k2: '<.k1> v2',
          k3: '<.> v3',
          k4: '<.wrong.key> v4',
        },
      });

      expect(result).to.deep.equal({
        'b1': 'root',
        'b1.@any': 'fallback',
        'b1.k1': 'v1',
        'b1.k2': 'v1 v2',
        'b1.k3': 'root v3',
        'b1.k4': 'fallback v4',
      });
    });

    it('should resolve relative <[path]> directives in extended keys', () => {
      const result = preCompile({
        b1: {
          k1: 'v1',
          k2: '<.k1> v2',
        },
        b2: {
          '@extends': 'b1',
          'k1': 'b2-v1',
        },
      });

      expect(result).to.deep.equal({
        'b1.k1': 'v1',
        'b1.k2': 'v1 v2',
        'b2.k1': 'b2-v1',
        'b2.k2': 'b2-v1 v2',
      });
    });
  });
});
