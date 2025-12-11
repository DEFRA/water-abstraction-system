'use strict'

/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

const InitiateSessionService = require('../services/billing-accounts/setup/initiate-session.service.js')
const SelectAccountService = require('../services/billing-accounts/setup/select-account.service.js')
const SubmitSelectAccountService = require('../services/billing-accounts/setup/submit-select-account.service.js')

async function viewSelectAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/select-account.njk`, pageData)
}

async function submitInitiateSession(request, h) {
  const { billingAccountId } = request.params

  const redirectUrl = await InitiateSessionService.go(billingAccountId)

  return h.redirect(redirectUrl)
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

module.exports = {
  viewSelectAccount,
  submitSelectAccount,
  submitInitiateSession
}
