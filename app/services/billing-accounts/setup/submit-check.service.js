'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @module SubmitCheckService
 */

const AddressModel = require('../../../models/address.model.js')
const ChangeAddressService = require('../change-address.service.js')
const FetchCompanyService = require('./fetch-company.service.js')
const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/check` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const { billingAccount } = session

  const existingAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const id = existingAccount ? session.existingAccount : session.billingAccount.company.id
  const companyContacts = await FetchCompanyContactsService.go(id)

  const address = await _address(session)
  const agentCompany = await _agentCompany(session, companyContacts, existingAccount)
  const contact = _contact(session, companyContacts)

  console.log(address)
  const result = await ChangeAddressService.go(billingAccount.id, address, agentCompany, contact)

  return {
    redirectUrl: `/system/billing-accounts/${billingAccount.id}`,
    ...result
  }
}

async function _address(session) {
  const addressSelected = !!session.addressSelected && session.addressSelected !== 'new'

  if (!addressSelected) {
    return session.addressJourney.address
  }

  const address = await AddressModel.query()
    .select(['address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    .findById(session.addressSelected)

  return {
    addressId: session.addressSelected,
    addressLine1: address.address1,
    addressLine2: address.address2,
    addressLine3: address.address3,
    addressLine4: address.address4,
    addressLine5: address.address5,
    addressLine6: address.address6,
    postcode: address.postcode
  }
}

async function _agentCompany(session, companyContacts, existingAccount) {
  let companyId
  let companyName = companyContacts.company.name

  const anotherAccountSelected = session.accountSelected === 'another'

  if (session.companiesHouseNumber) {
    const companysHouseResult = await FetchCompanyService.go(session.companiesHouseNumber)

    companyName = companysHouseResult.title
  } else {
    companyName = session.individualName
  }

  if (!anotherAccountSelected) {
    companyId = session.billingAccount.company.id
  } else if (existingAccount) {
    companyId = session.existingAccount
  }

  return {
    companyId,
    name: companyName,
    type: session.accountType === 'company' ? 'organisation' : 'person',
    companyNumber: session.companiesHouseNumber ?? null
  }
}

function _contact(session, companyContacts) {
  if (session.fao === 'no') {
    return {}
  }

  const { contacts } = companyContacts

  const existingContact = !!session.contactSelected && session.contactSelected !== 'new'
  let name = session.contactName

  if (existingContact) {
    const selectedContact = contacts.find((contact) => {
      return contact.id === session.contactSelected
    })

    name = selectedContact.$name()
  }

  return {
    ...(existingContact && { id: session.contactSelected }),
    type: 'department',
    department: name
  }
}

module.exports = {
  go
}
