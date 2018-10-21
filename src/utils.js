const constants = require('./constants');

/**
 * Returns true if passed value is an Array.
 */
function isArray(value) {
  return value instanceof Array;
}

/**
 * Returns true if passed value is JSON object.
 */
function isObject(value) {
  return typeof value === 'object' && value !== null && !isArray(value);
}

/**
 * Resolve passed paths parts to a result path.
 *
 * For example, this call:
 * resolvePath('k1', 'k2.k3', ['k4.k5', 'k6']);
 *
 * Will return:
 * ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
 */
function resolvePath(...paths) {
  return [].concat(...paths)
    .filter(v => typeof v === 'string' || isArray(v))
    .join('.').split('.')
    .filter(v => !!v);
}

/**
 * Returns a value in language pack by passed path considering @any directives.
 */
function getByPath(obj, path, noFallback) {
  if (!isArray(path)) {
    return getByPath(obj, resolvePath(path));
  }

  if (!path.length) {
    return obj;
  }

  const fallback = !noFallback ? obj[constants.FALLBACK_KEY] : undefined;
  let localValue = obj[path[0]];
  if (isObject(localValue)) {
    localValue = getByPath(localValue, path.slice(1));
  }

  return localValue || fallback;
}

module.exports = {
  isObject,
  resolvePath,
  getByPath,
};
