'use strict'

/**
 * Validates the licence ref submitted for the `/notices/setup/{sessionId}/licence` page for renewal notice types
 * @module LicenceRenewalValidator
 */

const Joi = require('joi')

const { licenceRefSchema } = require('../../../schemas/licence-ref.schema.js')

/**
 * Validates the licence ref submitted for the `/notices/setup/{sessionId}/licence` page for renewal notice types
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 * @param {object} licenceRenewal - the licence with renewal date fields fetched from the database
 * @param {Date} expiryDate - the target expiry date (90 days from today)
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceExists, licenceRenewal, expiryDate) {
  const schema = Joi.object({
    licenceRef: licenceRefSchema(licenceExists)
      .custom((value, helpers) => {
        return _licenceEnded(value, helpers, licenceRenewal)
      }, 'Custom Licence ended Validation')
      .messages({
        ended: 'The licence has ended'
      })
      .custom((value, helpers) => {
        return _licenceHasExpiryDate(value, helpers, licenceRenewal)
      }, 'Custom Licence has expiry date Validation')
      .messages({
        'no-expiry-date': 'The licence does not have an expiry date'
      })
      .custom((value, helpers) => {
        return _licenceExpiryDateInRange(value, helpers, licenceRenewal, expiryDate)
      }, 'Custom Licence expiry date in range Validation')
      .messages({
        'expiry-date-too-soon': 'The licence expiry date must be at least 90 days in the future'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

function _licenceEnded(value, helpers, licenceRenewal) {
  const endDate = licenceRenewal.$ends()

  if (!endDate || endDate.date > new Date()) {
    return value
  }

  return helpers.error('ended', { licenceRef: value })
}

function _licenceHasExpiryDate(value, helpers, licenceRenewal) {
  if (licenceRenewal.expiredDate) {
    return value
  }

  return helpers.error('no-expiry-date', { licenceRef: value })
}

function _licenceExpiryDateInRange(value, helpers, licenceRenewal, expiryDate) {
  if (!licenceRenewal.expiredDate || licenceRenewal.expiredDate >= expiryDate) {
    return value
  }

  return helpers.error('expiry-date-too-soon', { licenceRef: value })
}

module.exports = {
  go
}
