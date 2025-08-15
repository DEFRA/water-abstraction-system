'use strict'

/**
 * Validates data submitted for the `/users/me/profile-details` page
 * @module ProfileDetailsValidator
 */

const Joi = require('joi')

const MAX_ADDRESS_LENGTH = 300
const EMAIL_DOMAIN_PATTERN = /^.+@environment-agency.gov.uk$/
const MESSAGES = {
  name: {
    'string.max': 'Name must be 100 characters or less'
  },
  jobTitle: {
    'string.max': 'Job title must be 100 characters or less'
  },
  email: {
    'string.email': 'Enter a valid email',
    'string.pattern.name': 'Email must be @environment-agency.gov.uk'
  },
  tel: {
    'string.max': 'Telephone number must be 100 characters or less'
  },
  address: {
    'string.max': 'Address must be 300 characters or less'
  }
}

/**
 * Validates data submitted for the `/users/me/profile-details` page
 *
 * There is no validation on this at all - there probably should be.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(payload) {
  const schema = Joi.object().keys({
    name: Joi.string().max(100).allow('').messages(MESSAGES.name),
    jobTitle: Joi.string().max(100).allow('').messages(MESSAGES.jobTitle),
    email: Joi.string().email().allow('').pattern(EMAIL_DOMAIN_PATTERN, 'domain').messages(MESSAGES.email),
    tel: Joi.string().max(100).allow('').messages(MESSAGES.tel),
    address: Joi.string().max(MAX_ADDRESS_LENGTH).allow('').messages(MESSAGES.address)
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
