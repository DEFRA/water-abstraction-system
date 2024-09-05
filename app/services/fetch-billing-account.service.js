'use strict'

/**
 * Fetches the billing account and associated details for a given invoice account ID
 * @module FetchBillingAccountService
 */

const BillingAccount = require('../models/billing-account.model.js')

/**
 * Fetch the matching Billing account plus the current billing account address record linked to it
 *
 * @param {string} id - The UUID for the billing account to fetch
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
      'id',
      'accountNumber'
    ])
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('billingAccountAddresses')
    // The current billing account address is denoted by the fact it is the only one with a null end date
    .modifyGraph('billingAccountAddresses', (builder) => {
      builder.whereNull('endDate')
    })
    .withGraphFetched('billingAccountAddresses.address')
    .modifyGraph('billingAccountAddresses.address', (builder) => {
      builder.select([
        'id',
        'address1',
        'address2',
        'address3',
        'address4',
        'address5',
        'address6',
        'postcode',
        'country'
      ])
    })
    .withGraphFetched('billingAccountAddresses.company')
    .modifyGraph('billingAccountAddresses.company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('billingAccountAddresses.contact')
    .modifyGraph('billingAccountAddresses.contact', (builder) => {
      builder.select([
        'id',
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
