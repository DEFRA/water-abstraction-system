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
 * @param {object[]} licenceRefsWithDueReturns - The references of licences with due returns for the period and notice
 * type selected
 *
 * @returns {object} The result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceRefsWithDueReturns) {
  const schema = Joi.object({
    removeLicences: Joi.custom((value, helpers) => {
      return _removedLicencesWithDueReturnsValidator(value, helpers, licenceRefsWithDueReturns)
    }, 'Custom Licence Validation')
  }).messages({
    missingLicence: 'There are no returns due for licence {{#missingLicences}}',
    missingLicences: 'There are no returns due for licences {{#missingLicences}}'
  })

  return schema.validate(payload, { abortEarly: false })
}

function _findRemovedLicencesWithoutDueReturns(licenceRefsToRemove, licenceRefsWithDueReturns) {
  const missingLicences = []

  for (const licenceRefToRemove of licenceRefsToRemove) {
    if (!licenceRefsWithDueReturns.includes(licenceRefToRemove)) {
      missingLicences.push(licenceRefToRemove)
    }
  }

  return missingLicences
}

function _removedLicencesWithDueReturnsValidator(value, helpers, licenceRefsWithDueReturns) {
  const result = transformStringOfLicencesToArray(value)

  const missingLicences = _findRemovedLicencesWithoutDueReturns(result, licenceRefsWithDueReturns)

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
