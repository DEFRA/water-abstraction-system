'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCycleValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/returns-cycle` page
 *
 * When setting up a requirement users must specify a returns cycle for the return requirement. Users must select one
 * period for the returns cycle. If this requirement is not met the validation will return an error.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). The result from calling Joi's schema.validate().
 * If any errors are found the `error:` property will also exist detailing what the issue is.
 */
function go(payload) {
  const returnsCycle = payload.returnsCycle

  const VALID_VALUES = ['summer', 'winter-and-all-year']

  const errorMessage = 'Select the returns cycle for the requirements for returns'

  const schema = Joi.object({
    returnsCycle: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ returnsCycle }, { abortEarly: false })
}

module.exports = {
  go
}
