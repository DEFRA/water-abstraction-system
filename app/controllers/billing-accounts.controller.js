'use strict'

/**
 * Controller for /billing-accounts endpoints
 * @module BillingAccountsController
 */

const Boom = require('@hapi/boom')

const ChangeAddressService = require('../services/billing-accounts/change-address.service.js')
const ChangeAddressValidator = require('../validators/change-address.validator.js')

async function changeAddress(request, h) {
  const validatedData = ChangeAddressValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  const { address, agentCompany, contact } = validatedData.value

  const result = await ChangeAddressService.go(request.params.billingAccountId, address, agentCompany, contact)

  return h.response(result).code(201)
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError(error) {
  return Boom.badRequest(error.details[0].message)
}

module.exports = {
  changeAddress
}
