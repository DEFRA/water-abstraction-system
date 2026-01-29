'use strict'

/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @module AbstractionAlertsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    abstractionAlerts: Joi.required()
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
