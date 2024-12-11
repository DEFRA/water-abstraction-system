'use strict'

/**
 * Validates data submitted for the `/notifications/ad-hoc-returns/licence` page
 * @module LicenceValidator
 */

const Joi = require('joi')

/**
 * comment
 * @param {*} licenceId
 * @returns
 */
function go(payload) {
  console.log('🚀  payload:', payload)
  const schema = Joi.object({
    licenceRef: Joi.string().required().messages({
      'any.required': 'Enter a licence number',
      'string.empty': 'Enter a licence number'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
