'use strict'

/**
 * Validates data submitted for the check page
 * @module CheckValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the check page
 *
 * When submitting requirements for returns, users can specify if the return is a quarterly return submission. If a user
 * defines the return as a quarterly return submission, the requirements associated cannot contain a summer return
 * cycle. If these conditions are not met, the validation will return an error.
 *
 * @param {Array} requirements - The requirements for returns
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(requirements) {
  const errorMessage = "Quarterly returns submissions can't be set for returns in the summer cycle"

  const schema = Joi.array().items(
    Joi.object({
      returnsCycle: Joi.string().valid('winter-and-all-year').messages({ 'any.only': errorMessage })
    }).unknown(true)
  )

  return schema.validate(requirements, { abortEarly: true })
}

module.exports = {
  go
}
