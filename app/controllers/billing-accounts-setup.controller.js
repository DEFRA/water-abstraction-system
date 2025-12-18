'use strict'

/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

const InitiateSessionService = require('../services/billing-accounts/setup/initiate-session.service.js')
const SubmitSelectAccountService = require('../services/billing-accounts/setup/submit-select-account.service.js')
const SubmitSelectExistingAddressService = require('../services/billing-accounts/setup/submit-select-existing-address.service.js')
const ViewSelectAccountService = require('../services/billing-accounts/setup/view-select-account.service.js')
const ViewSelectExistingAddressService = require('../services/billing-accounts/setup/view-select-existing-address.service.js')

async function setup(request, h) {
  const { billingAccountId } = request.params

  const session = await InitiateSessionService.go(billingAccountId)

  return h.redirect(`/system/billing-accounts/setup/${session.id}/select-account`)
}

async function submitSelectExistingAddress(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitSelectExistingAddressService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/select-existing-address.njk`, pageData)
  }

  if (pageData.addressSelected === 'new') {
    return h.redirect(`/system/address/${sessionId}/postcode`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/for-attention-of`)
}

async function submitSelectAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitSelectAccountService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/select-account.njk`, pageData)
  }

  if (pageData.accountSelected === 'customer') {
    return h.redirect(`/system/billing-accounts/setup/${sessionId}/select-company-address`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/select-existing-account`)
}

async function viewSelectAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/select-account.njk`, pageData)
}

async function viewSelectExistingAddress(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectExistingAddressService.go(sessionId)

  return h.view(`billing-accounts/setup/select-existing-address.njk`, pageData)
}

module.exports = {
  setup,
  submitSelectAccount,
  submitSelectExistingAddress,
  viewSelectAccount,
  viewSelectExistingAddress
}
