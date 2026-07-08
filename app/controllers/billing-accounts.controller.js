/**
 * Controller for /billing-accounts endpoints
 * @module BillingAccountsController
 */

import http2 from 'node:http2'
import Boom from '@hapi/boom'
import ChangeAddressService from '../services/billing-accounts/change-address.service.js'
import ChangeAddressValidator from '../validators/change-address.validator.js'
import ViewBillingAccountService from '../services/billing-accounts/view-billing-account.service.js'

const { HTTP_STATUS_CREATED } = http2.constants

export async function changeAddress(request, h) {
  const validatedData = ChangeAddressValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  const { address, agentCompany, contact } = validatedData.value

  const result = await ChangeAddressService(request.params.billingAccountId, address, agentCompany, contact)

  return h.response(result).code(HTTP_STATUS_CREATED)
}

export async function view(request, h) {
  const { id } = request.params
  const { 'charge-version-id': chargeVersionId, 'company-id': companyId, 'licence-id': licenceId, page } = request.query

  const pageData = await ViewBillingAccountService(id, page, licenceId, chargeVersionId, companyId)

  return h.view('billing-accounts/view.njk', pageData)
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError(error) {
  return Boom.badRequest(error.details[0].message)
}
