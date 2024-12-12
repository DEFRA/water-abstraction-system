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
function go(data) {
  const schema = Joi.object({
    licenceVersionPurposeConditionTypeId: Joi.string().guid().required(),
    param1: Joi.string().allow(null).optional(),
    param2: Joi.string().allow(null).optional(),
    notes: Joi.string().allow(null).optional(),
    externalId: Joi.string().required()
  })

  const result = schema.validate(data, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
