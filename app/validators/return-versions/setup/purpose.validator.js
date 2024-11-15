'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposeValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 *
 * When setting up a requirement users must specify a purpose for the return requirement.
 * Users must select one or more purposes linked to the licence. If these requirements are not met
 * the validation will return an error.
 *
 * Users also have the option to add an alias (purpose description) to the purpose. This is not required but if added
 * we check to ensure it is no more than 100 characters.
 *
 * @param {object[]} purposes - The selected purposes and aliases (if entered) from the payload
 * @param {string[]} purposeIds - The IDs of the purposes in the database
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go (purposes, purposeIds) {
  const errorMessage = 'Select any purpose for the requirements for returns'

  const schema = Joi.object({
    purposes: Joi.array()
      .items({
        id: Joi
          .string()
          .valid(...purposeIds)
          .required()
          .messages({
            'any.required': errorMessage,
            'any.only': errorMessage
          }),
        alias: Joi
          .string()
          .max(100)
          .optional()
          .allow('')
          .messages({
            'string.max': 'Purpose description must be 100 characters or less'
          }),
        // Description will not be persisted. It is simply to avoid having to fetch the purpose description again in
        // the /check page. But if we didn't match a selected ID to a description in the SubmitPurposeService then
        // something has gone wrong!
        description: Joi
          .string()
      })
      .min(1)
      .required()
      .messages({
        'array.min': errorMessage
      })
  })

  return schema.validate({ purposes }, { abortEarly: true })
}

module.exports = {
  go
}
