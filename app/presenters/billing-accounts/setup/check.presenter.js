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
 * @param {object} existingAddress - The existing address of company
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyContacts, existingAddress) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected === 'customer' ? billingAccount.company.name : 'Another billing account',
    accountType: session.accountType ?? '',
    addressSelected: _address(existingAddress),
    existingAccount: _existingAccount(session, companyContacts),
    links: _links(session),
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchIndividualInput: session.searchIndividualInput ?? '',
    searchInput: session.searchInput ?? ''
  }
}

function _address(existingAddress) {
  if (existingAddress.length === 0) {
    return ['New']
  }

  const addressParts = [
    existingAddress.address1,
    existingAddress.address2,
    existingAddress.address3,
    existingAddress.address4,
    existingAddress.address5,
    existingAddress.address6,
    existingAddress.postcode
  ]

  const addressLines = addressParts
    .filter((part) => {
      return part && part.trim().length > 0
    })
    .map((part) => {
      return part.trim()
    })

  return addressLines
}

function _existingAccount(session, companyContacts) {
  if (session.existingAccount === 'new') {
    return 'New billing account'
  }

  if (!session.existingAccount) {
    return ''
  }

  return companyContacts.company.name
}

function _links(session) {
  return {
    accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
    accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
    addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
    existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`
  }
}

module.exports = {
  go
}
