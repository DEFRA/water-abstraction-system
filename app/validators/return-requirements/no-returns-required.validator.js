'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredValidator
 */
 
const Joi = require('joi')

function go (data) {
  const schema = Joi.object({
    reasonNewRequirements: Joi.string()
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
