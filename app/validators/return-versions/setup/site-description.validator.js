'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/site-description` page
 * @module SiteDescriptionValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/site-description` page
 *
 * When setting up a requirement users must specify a site description for the return requirement.
 * User must enter a site description between 10 and 100 characters. If these requirements are not met
 * the validation will return one of 3 errors, one for empty description and 2 more for above or below
 * character limits.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(payload) {
  const errorMessage = {
    empty: 'Enter a description of the site',
    small: 'Site description must be 10 characters or more',
    big: 'Site description must be 100 characters or less'
  }

  const schema = Joi.object({
    siteDescription: Joi.string().required().min(10).max(100).messages({
      'any.required': errorMessage.empty,
      'string.min': errorMessage.small,
      'string.max': errorMessage.big
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
