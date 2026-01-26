'use strict'

/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

const CheckService = require('../services/billing-accounts/setup/check.service.js')
const InitiateSessionService = require('../services/billing-accounts/setup/initiate-session.service.js')
const SubmitAccountService = require('../services/billing-accounts/setup/submit-account.service.js')
const SubmitCheckService = require('../services/billing-accounts/setup/submit-check.service.js')
const SubmitExistingAccountService = require('../services/billing-accounts/setup/submit-existing-account.service.js')
const SubmitExistingAddressService = require('../services/billing-accounts/setup/submit-existing-address.service.js')
const SubmitFAOService = require('../services/billing-accounts/setup/submit-fao.service.js')
const ViewAccountService = require('../services/billing-accounts/setup/view-account.service.js')
const ViewExistingAddressService = require('../services/billing-accounts/setup/view-existing-address.service.js')
const ViewExistingAccountService = require('../services/billing-accounts/setup/view-existing-account.service.js')
const ViewFAOService = require('../services/billing-accounts/setup/view-fao.service.js')

async function setup(request, h) {
  const { billingAccountId } = request.params

  const session = await InitiateSessionService.go(billingAccountId)

  return h.redirect(`/system/billing-accounts/setup/${session.id}/account`)
}

async function submitCheck(request, h) {
  const {
    params: { sessionId }
  } = request

  await SubmitCheckService.go(sessionId)

  return h.redirect(`/system/billing-accounts/setup/${sessionId}`)
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

async function submitExistingAddress(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAddressService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
  }

  if (pageData.addressSelected === 'new') {
    return h.redirect(`/system/address/${sessionId}/postcode`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/fao`)
}

async function submitAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAccountService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/account.njk`, pageData)
  }

  if (pageData.accountSelected === 'customer') {
    return h.redirect(`/system/billing-accounts/setup/${sessionId}/existing-address`)
  }

  return h.redirect(`/system/billing-accounts/setup/${sessionId}/existing-account`)
}

async function viewCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await CheckService.go(sessionId)

  return h.view(`billing-accounts/setup/check.njk`, pageData)
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

async function viewAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/account.njk`, pageData)
}

async function viewExistingAddress(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAddressService.go(sessionId)

  return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
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
  submitAccount,
  submitCheck,
  submitExistingAccount,
  submitExistingAddress,
  submitFAO,
  viewCheck,
  viewAccount,
  viewExistingAccount,
  viewExistingAddress,
  viewFAO
}
