'use strict'

const BillingAccountModel = require('../../app/models/billing-account.model.js')
const ContactModel = require('../../app/models/contact.model.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Represents a complete response from `FetchBillingAccountService`
 *
 * @returns {object} an object representing the billing account, bills and its related licence
 */
function billingAccount() {
  const contact = ContactModel.fromJson({
    id: generateUUID(),
    contactType: 'person',
    department: 'Testing department',
    firstName: 'Test',
    lastName: 'Testingson'
  })

  return {
    billingAccount: BillingAccountModel.fromJson({
      id: generateUUID(),
      accountNumber: 'S88897992A',
      createdAt: new Date('2023-12-14T18:42:59.659Z'),
      lastTransactionFile: null,
      lastTransactionFileCreatedAt: null,
      billingAccountAddresses: [
        {
          id: generateUUID(),
          address: {
            id: generateUUID(),
            address1: 'Tutsham Farm',
            address2: 'West Farleigh',
            address3: null,
            address4: null,
            address5: 'Maidstone',
            address6: 'Kent',
            postcode: 'ME15 0NE'
          },
          company: null,
          contact
        }
      ],
      company: {
        id: generateUUID(),
        name: 'Ferns Surfacing Limited'
      }
    }),
    bills: [
      {
        id: generateUUID(),
        createdAt: new Date('2023-12-14T18:42:59.659Z'),
        credit: false,
        invoiceNumber: false,
        netAmount: 10384,
        financialYearEnding: 2021,
        billRun: {
          id: generateUUID(),
          batchType: 'annual',
          billRunNumber: 607,
          scheme: 'alcs',
          source: 'nald',
          summer: false
        }
      }
    ],
    pagination: { total: 1 }
  }
}

module.exports = {
  billingAccount
}
