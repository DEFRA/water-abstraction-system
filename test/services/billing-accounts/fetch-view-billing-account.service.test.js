'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchViewBillingAccountService = require('../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

describe('Fetch Billing Account service', () => {
  let address
  let bill
  let billingAccount
  let billingAccountAddress
  let billingAccountId
  let billRun
  let company
  let licence
  let licenceId

  describe('when a matching billing account exists', () => {
    beforeEach(async () => {
      address = await AddressHelper.add()
      company = await CompanyHelper.add()

      billingAccount = await BillingAccountHelper.add({ companyId: company.id })
      billingAccountId = billingAccount.id

      billingAccountAddress = await BillingAccountAddressHelper.add({
        addressId: address.id,
        billingAccountId
      })

      billRun = await BillRunHelper.add()

      bill = await BillHelper.add({
        billingAccountId,
        billRunId: billRun.id
      })

      licence = await LicenceHelper.add()
      licenceId = licence.id

      await BillLicenceHelper.add({
        billId: bill.id,
        licenceId
      })
    })

    it('returns the matching billingAccount with related address, bills, bill runs, company, licence', async () => {
      const result = await FetchViewBillingAccountService.go(billingAccountId, 1)

      expect(result).to.equal({
        billingAccount: {
          id: billingAccountId,
          accountNumber: billingAccount.accountNumber,
          createdAt: billingAccount.createdAt,
          lastTransactionFile: null,
          lastTransactionFileCreatedAt: billingAccount.lastTransactionFileCreatedAt,
          billingAccountAddresses: [
            {
              id: billingAccountAddress.id,
              address: {
                id: address.id,
                address1: 'ENVIRONMENT AGENCY',
                address2: 'HORIZON HOUSE',
                address3: 'DEANERY ROAD',
                address4: 'BRISTOL',
                address5: null,
                address6: null,
                postcode: 'BS1 5AH'
              }
            }
          ],
          company: {
            id: company.id,
            name: 'Example Trading Ltd'
          }
        },
        bills: [
          {
            id: bill.id,
            createdAt: bill.createdAt,
            credit: null,
            invoiceNumber: null,
            netAmount: null,
            financialYear: null,
            billRun: {
              id: billRun.id,
              batchType: 'supplementary',
              billRunNumber: null,
              scheme: 'sroc',
              source: 'wrls',
              summer: false
            }
          }
        ],
        licenceId,
        pagination: { total: 1 }
      })
    })
  })
})
