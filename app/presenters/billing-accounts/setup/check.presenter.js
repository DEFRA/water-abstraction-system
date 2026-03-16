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
 * @param {object} companysHouseResult - The companys house details
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyContacts, existingAddress, companysHouseResult) {
  const { billingAccount } = session

  return {
    accountSelected: session.accountSelected === 'customer' ? billingAccount.company.name : 'Another billing account',
    accountType: session.accountType ?? '',
    addressSelected: _address(existingAddress),
    companySearch: session.companySearch ?? '',
    companiesHouseName: companysHouseResult ? companysHouseResult.title : '',
    contactSelected: _contactSelected(session, companyContacts),
    existingAccount: _existingAccount(session, companyContacts),
    fao: session.fao,
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

function _contactSelected(session, companyContacts) {
  const { contacts } = companyContacts

  if (session.contactSelected === 'new') {
    return 'New contact'
  }

  if (!companyContacts?.contacts?.length) {
    return ''
  }

  const contact = contacts.find((contact) => {
    return contact.id === session.contactSelected
  })
console.log(session, companyContacts)
  return contact.$name()
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
    companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
    companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
    contactSelected: `/system/billing-accounts/setup/${session.id}/contact`,
    existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
    fao: `/system/billing-accounts/setup/${session.id}/fao`
  }
}

module.exports = {
  go
}
