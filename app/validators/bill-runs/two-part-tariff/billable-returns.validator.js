'use strict'

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/match-details/{reviewChargeElementId}/amend-billable-returns` page
 * @module BillableReturnsValidator
 */

const Joi = require('joi')

function go (payload) {
  const { 'quantity-options': selectedOption } = payload

  if (selectedOption === 'customQuantity') {
    return _validateCustomQuantity(payload.customQuantity)
  }

  return _validateAuthorisedQuantity(selectedOption)
}

function _validateCustomQuantity (customQuantity) {
  const schema = Joi.object({
    customQuantity: Joi
      .number()
      .precision(7)
      .required()
      .messages({
        'any.number': 'You must enter a number',
        'any.required': 'You must enter a number',
        'number.precision': 'You must enter a maximum of 6 digits'
      })
  })

  return schema.validate({ customQuantity }, { abortEarly: false, allowUnknown: true })
}

function _validateAuthorisedQuantity (selectedOption) {
  const schema = Joi.object({
    selectedOption: Joi
      .number()
      .precision(6)
      .required()
      .messages({
        any: 'You must enter a number',
        number: 'You must enter a number',
        'number.precision': 'You must enter a maximum of 6 digits'
      })
  })

  return schema.validate({ selectedOption }, { abortEarly: false })
}

module.exports = {
  go
}
