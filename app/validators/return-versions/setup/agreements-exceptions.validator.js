'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/agreements-exceptions` page
 * @module AgreementsExceptionsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/agreements-exceptions` page
 *
 * When setting up a requirement users must specify an agreement and exception for the return requirement.
 * Users must select one or more agreements and exceptions linked to the licence. If these requirements are not met
 * the validation will return an error.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(payload) {
  const agreementsExceptions = payload.agreementsExceptions

  const errorMessage = 'Select if there are any agreements and exceptions needed for the requirements for returns'

  const schema = Joi.object({
    agreementsExceptions: Joi.array()
      .items(Joi.string().valid(...VALID_VALUES))
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'array.includesOne': errorMessage,
        'array.includes': errorMessage,
        'array.sparse': errorMessage
      })
  })

  return schema.validate({ agreementsExceptions }, { abortEarly: false })
}

const VALID_VALUES = [
  'gravity-fill',
  'transfer-re-abstraction-scheme',
  'two-part-tariff',
  '56-returns-exception',
  'none'
]

module.exports = {
  go
}
