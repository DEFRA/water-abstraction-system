'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/check` page
 * @module CheckValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/check` page
 *
 * When submitting requirements for returns, users can specify if the return is a quarterly return submission. If a user
 * defines the return as a quarterly return submission, the requirements associated cannot contain a summer return
 * cycle. If these conditions are not met, the validation will return an error.
 *
 * @param {Array} returnCycles - The returns cycles from the requirements for returns
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(returnCycles) {
  const errorMessage = "Quarterly returns submissions can't be set for returns in the summer cycle."

  const schema = Joi.array().items(Joi.string().valid('winter-and-all-year')).messages({ 'any.only': errorMessage })

  return schema.validate(returnCycles, { abortEarly: true })
}

module.exports = {
  go
}
