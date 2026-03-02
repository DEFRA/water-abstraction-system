'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 * @param {object} companyContacts - The company and its contacts
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyContacts) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected === 'customer' ? billingAccount.company.name : 'Another billing account',
    existingAccount: _existingAccount(session, companyContacts),
    links: _links(session),
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchInput: session.searchInput ?? ''
  }
}

function _existingAccount(session, companyContacts) {
  if (!session.existingAccount) {
    return ''
  }

  if (!!session.existingAccount && session.existingAccount !== 'new') {
    return companyContacts.company.name
  }

  return session.billingAccount.company.name
}

function _links(session) {
  return {
    accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
    existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`
  }
}

module.exports = {
  go
}
