'use strict'

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/region` page
 * @module BillRunsCreateRegionValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/region` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data, regions) {
  const validValues = regions.map((region) => {
    return region.id
  })

  const schema = Joi.object({
    region: Joi.string()
      .required()
      .valid(...validValues)
      .messages({
        'any.required': 'Select the region',
        'any.only': 'Select the region',
        'string.empty': 'Select the region'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
