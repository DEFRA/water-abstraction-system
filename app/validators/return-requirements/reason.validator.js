'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonValidator
 */

const Joi = require('joi')

function go (data) {
  const schema = Joi.object({
    selectReason: Joi.string()
      .required()
      .messages({
        'any.required': 'Select the reason for the return requirement',
        'string.empty': 'Select the reason for the return requirement'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
