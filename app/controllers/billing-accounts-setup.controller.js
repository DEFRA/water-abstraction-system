'use strict'

/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

const SelectAccountService = require('../services/billing-accounts/setup/select-account.service.js')
const SubmitSelectAccountService = require('../services/billing-accounts/setup/submit-select-account.service.js')

async function viewSelectAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await SelectAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/select-account.njk`, pageData)
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

  return h.redirect('')
}

module.exports = {
  viewSelectAccount,
  submitSelectAccount
}
