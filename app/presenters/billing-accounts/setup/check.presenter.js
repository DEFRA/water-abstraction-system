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
    accountSelected: session.accountSelected !== 'another' ? billingAccount.company.name : 'Another billing account',
    accountType: session.accountType ?? '',
    address: _address(session),
    addressSelected: _existingAddress(existingAddress),
    companySearch: session.companySearch ?? '',
    companiesHouseName: companysHouseResult ? companysHouseResult.title : '',
    contactName: session.contactName ?? '',
    contactSelected: _contactSelected(session, companyContacts),
    existingAccount: _existingAccount(session, companyContacts),
    fao: session.fao,
    links: _links(session),
    pageTitle: 'Check billing account details',
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`,
    individualName: session.individualName ?? '',
    searchInput: session.searchInput ?? ''
  }
}

function _address(session) {
  if (!session.addressJourney) {
    return []
  }

  const { address } = session.addressJourney

  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    address.addressLine3,
    address.addressLine4,
    address.postcode,
    address.country
  ].filter(Boolean)

  return addressLines
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

function _contactSelected(session, companyContacts) {
  const { contacts } = companyContacts

  if (session.contactSelected === 'new') {
    return 'New contact'
  }

  if (session.fao === 'no' || !companyContacts?.contacts?.length) {
    return null
  }

  const selectedContact = contacts.find((contact) => {
    return contact.id === session.contactSelected
  })

  return selectedContact.$name()
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
    address: `/system/address/${session.id}/postcode`,
    accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
    accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
    addressSelected: `/system/billing-accounts/setup/${session.id}/existing-address`,
    companiesHouseName: `/system/billing-accounts/setup/${session.id}/select-company`,
    companySearch: `/system/billing-accounts/setup/${session.id}/company-search`,
    contactName: `/system/billing-accounts/setup/${session.id}/contact-name`,
    contactSelected: `/system/billing-accounts/setup/${session.id}/contact`,
    existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`,
    fao: `/system/billing-accounts/setup/${session.id}/fao`
  }
}

module.exports = {
  go
}
