'use strict'

/**
 * Fetches the billing account and associated details for a given invoice account ID
 * @module FetchBillingAccountService
 */

const InvoiceAccount = require('../../models/crm-v2/invoice-account.model.js')

async function go (id) {
  return _fetch(id)
}

async function _fetch (id) {
  const result = InvoiceAccount.query()
    .findById(id)
    .select([
      'invoiceAccountId',
      'invoiceAccountNumber'
    ])
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select([
        'company_id',
        'type',
        'name'
      ])
    })
    .withGraphFetched('invoiceAccountAddresses')
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
        'type',
        'name'
      ])
    })
    .withGraphFetched('invoiceAccountAddresses.contact')
    .modifyGraph('invoiceAccountAddresses.contact', (builder) => {
      builder.select([
        'contactId',
        'firstName',
        'middleInitials',
        'lastName',
        'initials',
        'dataSource',
        'contactType',
        'suffix',
        'department'
      ])
    })

  return result
}

module.exports = {
  go
}
