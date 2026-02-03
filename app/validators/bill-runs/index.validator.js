'use strict'

/**
 * Validates data submitted for the `/bill-runs` page
 * @module IndexValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const MIN_YEAR_CREATED = 2014 // Based on the minimum year a bill run has been created in the system

/**
 * Validates data submitted for the `/bill-runs` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {module:BillRunModel[]} regions - An array of regions available in the system
 *
 * @returns {object} The result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, regions) {
  const maxYearCreated = new Date().getFullYear()
  const validRegionIds = _validRegionIds(regions)

  const schema = Joi.object({
    regions: Joi.array()
      .items(Joi.string().valid(...validRegionIds))
      .optional()
      .messages({
        'any.only': 'Select a valid region'
      }),
    yearCreated: Joi.number()
      .min(MIN_YEAR_CREATED)
      .integer()
      .max(maxYearCreated)
      .messages({
        'number.base': 'The year created must be a number',
        'number.max': `The year created cannot exceed the current year of ${maxYearCreated}`,
        'number.min': `The year created must be greater or equal to ${MIN_YEAR_CREATED}`,
        'number.integer': 'The year created must be a whole number'
      })
  })

  return schema.validate(payload)
}

function _validRegionIds(regions) {
  return regions.map((region) => {
    return region.id
  })
}

module.exports = {
  go
}
