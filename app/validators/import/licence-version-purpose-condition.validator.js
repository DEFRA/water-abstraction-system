'use strict'

/**
 * @module LicenceVersionPurposeConditionValidator
 */

const Joi = require('joi')

/**
 * Checks that the data for inserting/updating the water.licence_version_purpose_conditions table is valid
 *
 * @param {object} data - The data to be validated
 *
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
*/
function go (data) {
  const schema = Joi.object({
    licenceVersionPurposeId: Joi.string().guid().optional(),
    licenceVersionPurposeConditionTypeId: Joi.string().guid().required(),
    param1: Joi.string().optional(),
    param2: Joi.string().optional(),
    notes: Joi.string().optional(),
    externalId: Joi.string().required(),
    source: Joi.string().required(),
    dateCreated: Joi.date().optional(),
    dateUpdated: Joi.date().optional()
  })

  const result = schema.validate(data)

  if (Object.hasOwn(result, 'error')) {
    throw new Error(result.error.details[0].message)
  }

  return result
}

module.exports = {
  go
}
