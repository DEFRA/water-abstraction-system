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
    addressSelected: _existingAddress(existingAddress),
    existingAccount: _existingAccount(session, companyContacts),
    links: _links(session),
    newAddress: _newAddress(session),
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    searchIndividualInput: session.searchIndividualInput ?? '',
    searchInput: session.searchInput ?? ''
  }
}

function _existingAddress(existingAddress) {
  if (existingAddress.length === 0) {
    return ['New']
  }

  const addressLines = [
    existingAddress.address1,
    existingAddress.address2,
    existingAddress.address3,
    existingAddress.address4,
    existingAddress.address5,
    existingAddress.address6,
    existingAddress.postcode
  ].filter(Boolean)

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
    existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
    newAddress: `/system/address/${session.id}/postcode`
  }
}

function _newAddress(session) {
  const { address } = session.addressJourney

  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressLine4,
    address.country,
    address.postcode
  ].filter(Boolean)

  return addressLines
}

module.exports = {
  go
}
