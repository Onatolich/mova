const { isObject, resolvePath, getByPath } = require('./utils');
const constants = require('./constants');

/**
 * Flattens passed language pack to a single level object
 * where each key is a path to some value joined with "."
 *
 * For example this pack:
 * {
 *   branch: {
 *     '@root': 'root',
 *     '@any': 'fallback',
 *     key: 'value',
 *     innerBranch: {
 *       innerKey: 'innerValue'
 *     }
 *   }
 * }
 *
 * Will be flattened to:
 * {
 *   'branch': 'root',
 *   'branch.@any': 'fallback',
 *   'branch.key': 'value',
 *   'branch.innerBranch.innerKey': 'innerValue'
 * }
 */
function flatten(branch, language, prefix = '') {
  if (!branch) {
    return {};
  }

  if (!language) {
    return flatten(branch, branch);
  }

  return Object.keys(branch).reduce((result, key) => {
    const resultKey = [prefix, key].filter(v => !!v && v !== constants.ROOT_KEY).join('.');
    const value = branch[key];

    if (isObject(value)) {
      if (key === constants.ROOT_KEY) {
        throw new Error(`${constants.ROOT_KEY} key can only contain a string! At ${resultKey}`);
      }

      return {
        ...result,
        ...flatten(value, language, resultKey),
      };
    }

    return {
      ...result,
      [resultKey]: value,
    };
  }, {});
}

/**
 * Returns passed branch with resolved in-value references defined by <[path]> directives.
 */
function resolveReferences(value, path, language) {
  if (!path) {
    return resolveReferences(value, [], value);
  }

  if (isObject(value)) {
    return Object.keys(value).reduce((result, key) => {
      return {
        ...result,
        [key]: resolveReferences(value[key], resolvePath(path, key), language),
      };
    }, {});
  }

  if (!value) {
    return path.join('.');
  }

  return value.replace(/<([a-z0-9.]+)>/gi, function(_, match) {
    const root = match[0] === '.' ? path.slice(0, path.length - 1) : [];
    const searchPath = resolvePath(root, match);
    const pathValue = getByPath(language, searchPath);

    if (isObject(pathValue)) {
      return pathValue[constants.ROOT_KEY] || pathValue[constants.FALLBACK_KEY];
    }
    return resolveReferences(pathValue, searchPath, language);
  });
}

/**
 * Returns passed branch with resolved @extends directives.
 *
 * For example, this pack:
 * {
 *   branch1: {
 *     key: 'value'
 *   },
 *   branch2: {
 *     '@extends': 'branch1',
 *     key2: 'value2'
 *   }
 *   branch3: {
 *     '@extends': 'branch2',
 *     key2: 'value3'
 *   }
 * }
 *
 * Will be resolved to:
 * {
 *   branch1: {
 *     key: 'value'
 *   },
 *   branch2: {
 *     key: 'value',
 *     key2: 'value2'
 *   }
 *   branch3: {
 *     key: 'value',
 *     key2: 'value3'
 *   }
 * }
 */
function resolveInheritance(branch, language) {
  if (!branch) {
    return {};
  }

  if (!language) {
    return resolveInheritance(branch, branch);
  }

  const extendsPath = branch[constants.EXTENDS_KEY] || '';
  let extendResult = {};

  if (extendsPath.length) {
    const inheritBranch = getByPath(language, extendsPath, false);
    if (!isObject(inheritBranch)) {
      throw new Error(`Path ${extendsPath} can not be extended as its value is not an object!`);
    }

    extendResult = resolveInheritance(inheritBranch, language);
  }

  return Object.keys(branch).reduce((result, key) => {
    if (key === constants.EXTENDS_KEY) {
      return result;
    }

    const value = branch[key];
    return {
      ...result,
      [key]: isObject(value) ? resolveInheritance(value, language) : value,
    };
  }, extendResult);
}

/**
 * Pre compiles passed language pack for better runtime performance.
 */
module.exports = function preCompile(language) {
  return flatten(resolveReferences(resolveInheritance(language)));
};
