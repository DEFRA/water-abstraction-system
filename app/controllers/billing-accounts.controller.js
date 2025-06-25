'use strict'

/**
 * Controller for /billing-accounts endpoints
 * @module BillingAccountsController
 */

const Boom = require('@hapi/boom')

const ChangeAddressService = require('../services/billing-accounts/change-address.service.js')
const ChangeAddressValidator = require('../validators/change-address.validator.js')
const ViewBillingAccountService = require('../services/billing-accounts/view-billing-account.service.js')

async function changeAddress(request, h) {
  const validatedData = ChangeAddressValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  const { address, agentCompany, contact } = validatedData.value

  const result = await ChangeAddressService.go(request.params.billingAccountId, address, agentCompany, contact)

  return h.response(result).code(201)
}

async function view(request, h) {
  const { id } = request.params
  const { 'charge-version-id': chargeVersionId, 'licence-id': licenceId, page = 1 } = request.query

  const pageData = await ViewBillingAccountService.go(id, page, licenceId, chargeVersionId)

  return h.view('billing-accounts/view.njk', pageData)
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError(error) {
  return Boom.badRequest(error.details[0].message)
}

module.exports = {
  changeAddress,
  view
}
