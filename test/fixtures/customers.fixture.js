'use strict'

const BillingAccountModel = require('../../app/models/billing-account.model.js')
const LicenceModel = require('../../app/models/licence.model.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const { generateAccountNumber } = require('../support/helpers/billing-account.helper.js')

/**
 * A representation from the billing accounts 'FetchBillingAccountsService'
 *
 * @returns {object[]} A array of billing accounts
 */
function billingAccounts() {
  return [
    BillingAccountModel.fromJson({
      accountNumber: generateAccountNumber(),
      billingAccountAddresses: [
        {
          address: {
            address1: 'ENVIRONMENT AGENCY',
            address2: 'HORIZON HOUSE',
            address3: 'DEANERY ROAD',
            address4: 'BRISTOL',
            address5: null,
            address6: null,
            country: 'United Kingdom',
            id: generateUUID(),
            postcode: 'BS1 5AH'
          },
          company: null,
          contact: null,
          id: generateUUID()
        }
      ],
      company: {
        id: generateUUID(),
        name: 'Tyrell Corporation',
        type: 'organisation'
      },
      id: generateUUID()
    })
  ]
}

/**
 * A representation from the customers 'FetchCustomerService'
 *
 * @returns {object} A customer object
 */
function customer() {
  return {
    id: generateUUID(),
    name: 'Tyrell Corporation'
  }
}

/**
 * A representation from the customers 'FetchLicencesService'
 *
 * @returns {object[]} A array of licences
 */
function licences() {
  return [
    LicenceModel.fromJson({
      endDate: null,
      id: generateUUID(),
      licenceRef: generateLicenceRef(),
      licenceDocumentHeader: {
        id: generateUUID(),
        licenceName: 'Between Two Tyrell'
      },
      startDate: new Date('2022-01-01')
    })
  ]
}

module.exports = {
  billingAccounts,
  customer,
  licences
}
