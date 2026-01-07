'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')

// Thing under test
const FetchBillingAccountsService = require('../../../app/services/customers/fetch-billing-accounts.service.js')

describe('Customers - Fetch billing accounts service', () => {
  let address
  let company
  let billingAccount
  let billingAccountAddress

  before(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()

    billingAccount = await BillingAccountHelper.add({
      companyId: company.id
    })

    billingAccountAddress = await BillingAccountAddressHelper.add({
      billingAccountId: billingAccount.id,
      addressId: address.id
    })

    // Additional Billing Account
    await BillingAccountHelper.add()
  })

  it('returns the billing accounts for the company', async () => {
    const result = await FetchBillingAccountsService.go(company.id)

    expect(result).to.equal({
      billingAccounts: [
        {
          accountNumber: billingAccount.accountNumber,
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
                id: address.id,
                postcode: 'BS1 5AH'
              },
              company: null,
              contact: null,
              id: billingAccountAddress.id
            }
          ],
          company: {
            id: company.id,
            name: 'Example Trading Ltd',
            type: 'organisation'
          },
          id: billingAccount.id
        }
      ],
      pagination: {
        total: 1
      }
    })
  })
})
