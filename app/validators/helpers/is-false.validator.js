/**
 * Custom Joi validator that fails when the provided flag is true
 *
 * @param {boolean} booleanToCheck - Flag indicating whether validation should fail
 * @param {string} [errorKey='custom.isFalse'] - The Joi error key to return on failure
 *
 * @returns {Function} Joi custom validator callback
 *
 * The returned callback:
 * - returns the validated field value when booleanToCheck is false
 * - returns helpers.error(errorKey) when booleanToCheck is true, defaulting to 'custom.isFalse'
 */
function isFalse(booleanToCheck, errorKey = 'custom.isFalse') {
  return function (value, helpers) {
    if (booleanToCheck === false) {
      return value
    }

    return helpers.error(errorKey)
  }
}
export {
  isFalse
}
export default {
  isFalse
}
