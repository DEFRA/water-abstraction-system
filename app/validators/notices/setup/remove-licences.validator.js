'use strict'

/**
 * Validates data submitted for the `/notices/setup/remove-licences` page
 * @module RemoveLicencesValidator
 */

const Joi = require('joi')

const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Validates data submitted for the `/notices/setup/remove-licences` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} validLicences - The licences that that have due returns for the selected notification period
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, validLicences) {
  const validLicenceRefs = validLicences.map((licence) => {
    return licence.licenceRef
  })

  const schema = Joi.object({
    removeLicences: Joi.custom((value, helpers) => {
      return _removedLicencesInValidLicencesValidator(value, helpers, validLicenceRefs)
    }, 'Custom Licence Validation')
  }).messages({
    missingLicence: 'There are no returns due for licence {{#missingLicences}}',
    missingLicences: 'There are no returns due for licences {{#missingLicences}}'
  })

  return schema.validate(payload, { abortEarly: false })
}

function _findRemovedLicencesNotInValidLicences(licenceRefsToRemove, validLicenceRefs) {
  const missingLicences = []

  for (const licenceRefToRemove of licenceRefsToRemove) {
    if (!validLicenceRefs.includes(licenceRefToRemove)) {
      missingLicences.push(licenceRefToRemove)
    }
  }

  return missingLicences
}

function _removedLicencesInValidLicencesValidator(value, helpers, validLicenceRefs) {
  const result = transformStringOfLicencesToArray(value)

  const missingLicences = _findRemovedLicencesNotInValidLicences(result, validLicenceRefs)

  if (missingLicences.length > 0) {
    const messageKey = missingLicences.length === 1 ? 'missingLicence' : 'missingLicences'
    const missingValue = missingLicences.join(', ')

    return helpers.error(messageKey, { missingLicences: missingValue })
  }

  return result
}

module.exports = {
  go
}
