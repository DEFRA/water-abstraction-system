/**
 * Validates the licence and that it has due returns, for the returns notice types, submitted for the `/notices/setup/{sessionId}/licence` page
 * @module LicenceDueReturnsValidator
 */

import Joi from 'joi'

import { licenceRefSchema } from '../../../schemas/licence-ref.schema.js'

/**
 * Validates the licence and that it has due returns, for the returns notice types, submitted for the `/notices/setup/{sessionId}/licence` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 * @param {boolean} dueReturnsExist - the result of checking if the licence has due returns present in the database
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceExists, dueReturnsExist) {
  const schema = Joi.object({
    licenceRef: licenceRefSchema(licenceExists)
      .custom((value, helpers) => {
        return _dueReturns(value, helpers, dueReturnsExist)
      }, 'Custom Licence due returns Validation')
      .messages({
        dueReturns: 'There are no returns due for licence {{#licenceRef}}'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

function _dueReturns(value, helpers, dueReturnsExist) {
  if (dueReturnsExist) {
    return value
  }

  return helpers.error('dueReturns', { licenceRef: value })
}

export default {
  go
}
