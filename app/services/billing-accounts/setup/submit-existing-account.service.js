'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @module SubmitExistingAccountService
 */

const ExistingAccountPresenter = require('../../../presenters/billing-accounts/setup/existing-account.presenter.js')
const ExistingAccountValidator = require('../../../validators/billing-accounts/setup/existing-account.validator.js')
const FetchCompaniesService = require('./fetch-companies.service.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      existingAccount: payload.existingAccount
    }
  }

  const companySearchResults = await FetchCompaniesService.go(session.searchInput)

  const pageData = ExistingAccountPresenter.go(session, companySearchResults)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.existingAccount = payload.existingAccount

  if (session.addressSelected !== 'new') {
    session.addressJourney = {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-account`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/fao`
    }
  } else {
    session.addressJourney = null
  }

  return session.$update()
}

function _validate(payload) {
  const validationResult = ExistingAccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
