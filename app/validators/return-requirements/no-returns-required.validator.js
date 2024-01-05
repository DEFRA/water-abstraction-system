'use strict'

const Joi = require('joi')
const { reasonNewRequirementsFields } = require('../../lib/static-lookups.lib.js')

function go (data) {
  const schema = Joi.object({
    reasonNewRequirements: Joi.string()
      .valid(...reasonNewRequirementsFields)
      .required()
      .messages({
        'any.required': 'Select the reason for the return requirement',
        'string.empty': 'Select the reason for the return requirement',
        'any.only': 'Select a valid reason for the return requirement'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
