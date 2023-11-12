'use strict'

/**
 * Fetches the billing account and associated details for a given invoice account ID
 * @module FetchBillingAccountService
 */

const BillingAccount = require('../../models/crm-v2/billing-account.model.js')

/**
 * Fetch the matching Billing account plus the current account address record linked to it
 *
 * @param {string} id The UUID for the billing account to fetch
 *
 * @returns the matching instance of BillModel including linked company and just the current account address record
 */
async function go (id) {
  return _fetch(id)
}

async function _fetch (id) {
  const result = BillingAccount.query()
    .findById(id)
    .select([
      'invoiceAccountId',
      'invoiceAccountNumber'
    ])
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select([
        'company_id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('invoiceAccountAddresses')
    // The current invoice account address is denoted by the fact it is the only one with a null end date
    .modifyGraph('invoiceAccountAddresses', (builder) => {
      builder.whereNull('endDate')
    })
    .withGraphFetched('invoiceAccountAddresses.address')
    .modifyGraph('invoiceAccountAddresses.address', (builder) => {
      builder.select([
        'addressId',
        'address1',
        'address2',
        'address3',
        'address4',
        'town',
        'county',
        'postcode',
        'country'
      ])
    })
    .withGraphFetched('invoiceAccountAddresses.agentCompany')
    .modifyGraph('invoiceAccountAddresses.agentCompany', (builder) => {
      builder.select([
        'companyId',
        'name',
        'type'
      ])
    })
    .withGraphFetched('invoiceAccountAddresses.contact')
    .modifyGraph('invoiceAccountAddresses.contact', (builder) => {
      builder.select([
        'contactId',
        'contactType',
        'dataSource',
        'department',
        'firstName',
        'initials',
        'lastName',
        'middleInitials',
        'salutation',
        'suffix'
      ])
    })

  return result
}

module.exports = {
  go
}
