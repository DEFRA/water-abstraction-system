'use strict'

/**
 * Validates data submitted for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @module CompanySearchValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    companySearch: Joi.string().required().max(100).messages({
      'any.required': 'Enter the Companies House number or company name',
      'string.max': 'Companies House number or company name must be 100 characters or less'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
