'use strict'

const ContactModel = require('../../app/models/contact.model.js')

/**
 * Represents a complete response from `FetchBillingAccountService`
 *
 * @returns {object} an object representing the billing account, bills and its related licence
 */
function billingAccount() {
  const contact = ContactModel.fromJson({
    id: '93403c8c-ff7d-4ec7-a6be-7a4451e3ac72',
    contactType: 'person',
    department: 'Testing department',
    firstName: 'Test',
    lastName: 'Testingson'
  })

  return {
    billingAccount: {
      id: '9b03843e-848b-497e-878e-4a6628d4f683',
      accountNumber: 'S88897992A',
      createdAt: new Date('2023-12-14T18:42:59.659Z'),
      lastTransactionFile: null,
      lastTransactionFileCreatedAt: null,
      billingAccountAddresses: [
        {
          id: '04ba8291-fb58-40a9-9581-cfedc136eef7',
          address: {
            id: '310ae9a7-69c1-49b3-a29f-0ba46e6cfa7b',
            address1: 'Tutsham Farm',
            address2: 'West Farleigh',
            address3: null,
            address4: null,
            address5: 'Maidstone',
            address6: 'Kent',
            postcode: 'ME15 0NE'
          },
          contact
        }
      ],
      company: {
        id: '55a71eb5-e0e1-443e-9a25-c529cccfd6df',
        name: 'Ferns Surfacing Limited'
      }
    },
    bills: [
      {
        id: '3d1b5d1f-9b57-4a28-bde1-1d57cd77b203',
        createdAt: new Date('2023-12-14T18:42:59.659Z'),
        credit: false,
        invoiceNumber: false,
        netAmount: 10384,
        financialYearEnding: 2021,
        billRun: {
          id: 'eee30072-ad12-426a-9d69-c712f38e581d',
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
