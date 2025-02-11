'use strict'

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 * @module RemoveLicencesValidator
 */

const Joi = require('joi')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} validLicences - The licences present in the database
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, validLicences) {
  const schema = Joi.object(
    {
      removeLicences: Joi.custom((value, helpers) => {
        const expectedLicences = validLicences.map((licence) => licence.licenceRef)
        const result = transformStringOfLicencesToArray(value)

        const missingLicences = _findMissingElements(result, expectedLicences)

        if (missingLicences.length > 0) {
          const messageKey = missingLicences.length === 1 ? 'missingLicence' : 'missingLicences'
          const missingValue = missingLicences.length === 1 ? missingLicences[0] : missingLicences.join(', ')

          return helpers.error(messageKey, { missingLicences: missingValue })
        }

        return result
      })
    },
    'Custom Licence Validation'
  ).messages({
    missingLicence: 'There are no returns due for licence {{#missingLicences}}',
    missingLicences: 'There are no returns due for licences {{#missingLicences}}'
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Finds the elements that are present in one array but missing in the other.
 *
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} An array containing all the elements not found in either array
 */
function _findMissingElements(arr1, arr2) {
  const cleanArr1 = arr1.filter((item) => item !== undefined && item !== null)
  const cleanArr2 = arr2.filter((item) => item !== undefined && item !== null)

  const missingInArr2 = cleanArr1.filter((item) => !cleanArr2.includes(item))
  const missingInArr1 = cleanArr2.filter((item) => !cleanArr1.includes(item))

  return [...missingInArr2, ...missingInArr1]
}

module.exports = {
  go
}
