'use strict'

/**
 * Custom Joi validator that fails when the provided flag is true
 *
 * @param {boolean} booleanToCheck - Flag indicating whether validation should fail
 *
 * @returns {Function} Joi custom validator callback
 *
 * The returned callback:
 * - returns the validated field value when booleanToCheck is false
 * - returns helpers.error('custom.isFalse') when booleanToCheck is true
 */
function isFalse(booleanToCheck) {
  return function (value, helpers) {
    if (booleanToCheck === false) {
      return value
    }

    return helpers.error('custom.isFalse')
  }
}
module.exports = {
  isFalse
}
