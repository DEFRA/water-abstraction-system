import BillingAccountModel from 'water-abstraction-engine/models/billing-account.model.js'
import ContactModel from 'water-abstraction-engine/models/contact.model.js'
import { generateAccountNumber, generateUUID } from 'water-abstraction-engine/test/generators.js'

/**
 * Represents a complete response from `FetchBillingAccountService`
 *
 * @returns {object} an object representing the billing account, bills and its related licence
 */
function billingAccount() {
  const contact = ContactModel.fromJson({
    contactType: 'person',
    department: 'Testing department',
    firstName: 'Test',
    id: generateUUID(),
    lastName: 'Testingson'
  })

  return {
    billingAccount: BillingAccountModel.fromJson({
      accountNumber: generateAccountNumber(),
      billingAccountAddresses: [
        {
          address: {
            address1: 'Tutsham Farm',
            address2: 'West Farleigh',
            address3: null,
            address4: null,
            address5: 'Maidstone',
            address6: 'Kent',
            id: generateUUID(),
            postcode: 'ME15 0NE'
          },
          company: null,
          contact,
          id: generateUUID()
        }
      ],
      company: {
        id: generateUUID(),
        name: 'Ferns Surfacing Limited'
      },
      createdAt: new Date('2023-12-14T18:42:59.659Z'),
      id: generateUUID(),
      lastTransactionFile: null,
      lastTransactionFileCreatedAt: null
    }),
    bills: [
      {
        billRun: {
          batchType: 'annual',
          billRunNumber: 607,
          id: generateUUID(),
          scheme: 'alcs',
          source: 'nald',
          summer: false
        },
        createdAt: new Date('2023-12-14T18:42:59.659Z'),
        credit: false,
        financialYearEnding: 2021,
        id: generateUUID(),
        invoiceNumber: false,
        netAmount: 10384
      }
    ],
    totalNumber: 1
  }
}

export default {
  billingAccount
}
