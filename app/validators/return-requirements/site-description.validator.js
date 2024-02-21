'use strict'

const Joi = require('joi')

function go (data) {
  const errorMessage = {
    empty: 'Enter a description of the site',
    small: 'Site description must be 10 characters or more',
    big: 'Site description must be 100 characters or less'
  }

  const schema = Joi.object({
    siteDescription: Joi.string()
      .required()
      .min(10)
      .max(100)
      .messages({
        'any.required': errorMessage.empty,
        'string.min': errorMessage.small,
        'string.max': errorMessage.big
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
