'use strict'

/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

const InitiateSessionService = require('../services/billing-accounts/setup/initiate-session.service.js')
const SubmitFAOService = require('../services/billing-accounts/setup/submit-fao.service.js')
const SubmitSelectAccountService = require('../services/billing-accounts/setup/submit-select-account.service.js')
const SubmitExistingAccountService = require('../services/billing-accounts/setup/submit-existing-account.service.js')
const SubmitSelectExistingAddressService = require('../services/billing-accounts/setup/submit-select-existing-address.service.js')
const ViewFAOService = require('../services/billing-accounts/setup/view-fao.service.js')
const ViewSelectAccountService = require('../services/billing-accounts/setup/view-select-account.service.js')
const ViewExistingAccountService = require('../services/billing-accounts/setup/view-existing-account.service.js')
const ViewSelectExistingAddressService = require('../services/billing-accounts/setup/view-select-existing-address.service.js')

async function setup(request, h) {
  const { billingAccountId } = request.params

  const session = await InitiateSessionService.go(billingAccountId)

  return h.redirect(`/system/billing-accounts/setup/${session.id}/select-account`)
}

async function submitFAO(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitFAOService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/fao.njk`, pageData)
  }

  if (pageData.fao === 'yes') {
    return h.redirect(`/system/billing-accounts/setup/${sessionId}/select-contact`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/check`)
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

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/fao`)
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
    return h.redirect(`/system/billing-accounts/setup/${sessionId}/select-existing-address`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/existing-account`)
}

async function viewExistingAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
}

async function viewFAO(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewFAOService.go(sessionId)

  return h.view(`billing-accounts/setup/fao.njk`, pageData)
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

async function submitExistingAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAccountService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
  }

  if (pageData.existingAccount === 'new') {
    return h.redirect(`/system/billing-accounts/setup/${sessionId}/account-type`)
  }

  return h.redirect(`/system/address/${sessionId}/postcode`)
}

module.exports = {
  setup,
  submitExistingAccount,
  submitFAO,
  submitSelectAccount,
  submitSelectExistingAddress,
  viewExistingAccount,
  viewFAO,
  viewSelectAccount,
  viewSelectExistingAddress
}
