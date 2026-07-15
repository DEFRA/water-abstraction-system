/**
 * Validates the licence ref submitted for the `/notices/setup/{sessionId}/licence` page for renewal notice types
 * @module LicenceRenewalValidator
 */

import Joi from 'joi'

import { licenceRefSchema } from '../../../schemas/licence-ref.schema.js'
import { renewalNoticeDate } from '../../../../lib/dates.lib.js'
import { today } from '../../../../lib/general.lib.js'

/**
 * Validates the licence ref submitted for the `/notices/setup/{sessionId}/licence` page for renewal notice types
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object|undefined} licenceRenewal - the licence with renewal date fields fetched from the database (undefined if not found)
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found, the `error:` property will also exist detailing what the issues were
 */
export default function licenceRenewalValidator(payload, licenceRenewal) {
  const schema = Joi.object({
    licenceRef: licenceRefSchema(!!licenceRenewal)
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
        return _licenceExpiryDateInRange(value, helpers, licenceRenewal)
      }, 'Custom Licence expiry date in range Validation')
      .messages({
        'expiry-date-too-soon': 'The licence expires in less than 90 days'
      })
  })

  return schema.validate(payload, { abortEarly: true })
}

function _licenceEnded(value, helpers, licenceRenewal) {
  const todaysDate = today()

  const { expiredDate, lapsedDate, revokedDate } = licenceRenewal
  const hasEnded = [expiredDate, lapsedDate, revokedDate].filter(Boolean).some((date) => {
    return date <= todaysDate
  })

  if (hasEnded) {
    return helpers.error('ended', { licenceRef: value })
  }

  return value
}

function _licenceHasExpiryDate(value, helpers, licenceRenewal) {
  if (licenceRenewal.expiredDate) {
    return value
  }

  return helpers.error('no-expiry-date', { licenceRef: value })
}

function _licenceExpiryDateInRange(value, helpers, licenceRenewal) {
  if (!licenceRenewal.expiredDate) {
    return value
  }

  const todaysDate = today()

  const renewalDate = renewalNoticeDate(licenceRenewal.expiredDate)

  if (renewalDate >= todaysDate) {
    return value
  }

  return helpers.error('expiry-date-too-soon', { licenceRef: value })
}
