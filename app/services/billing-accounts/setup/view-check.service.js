'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module ViewCheckService
 */

const CheckPresenter = require('../../../presenters/billing-accounts/setup/check.presenter.js')
const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
const SessionModel = require('../../../models/session.model.js')
const { markCheckPageVisited } = require('../../../lib/check-page.lib.js')

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const companyContacts = await _fetchCompanyContacts(session)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter.go(session, companyContacts)

  return {
    ...pageData
  }
}

async function _fetchCompanyContacts(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyContacts = await FetchCompanyContactsService.go(companyId)

  return companyContacts
}

module.exports = {
  go
}
