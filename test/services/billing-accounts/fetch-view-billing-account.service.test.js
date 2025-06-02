'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')

// Thing under test
const FetchViewBillingAccountService = require('../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

describe('Fetch Billing Account service', () => {
  let address
  let bill1
  let billingAccount
  let billingAccountAddress
  let billingAccountId
  let billRun1
  let billRun2
  let billRun3
  let company
  let contact

  describe('when a matching billing account exists', () => {
    beforeEach(async () => {
      address = await AddressHelper.add()
      contact = await ContactHelper.add()
      company = await CompanyHelper.add()

      billingAccount = await BillingAccountHelper.add({ companyId: company.id })
      billingAccountId = billingAccount.id

      billingAccountAddress = await BillingAccountAddressHelper.add({
        addressId: address.id,
        billingAccountId,
        contactId: contact.id
      })

      billRun1 = await BillRunHelper.add({
        status: 'sent'
      })

      billRun2 = await BillRunHelper.add({
        status: 'ready'
      })

      billRun3 = await BillRunHelper.add({
        status: 'error'
      })

      bill1 = await BillHelper.add({
        billingAccountId,
        billRunId: billRun1.id
      })

      await BillHelper.add({
        billingAccountId,
        billRunId: billRun2.id
      })

      await BillHelper.add({
        billingAccountId,
        billRunId: billRun3.id
      })
    })

    it('returns the matching billingAccount with related address, company, and bills with a bill run status of "sent"', async () => {
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
              },
              contact: {
                id: contact.id,
                contactType: contact.contactType,
                department: contact.department,
                firstName: contact.firstName,
                lastName: contact.lastName
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
            id: bill1.id,
            createdAt: bill1.createdAt,
            credit: bill1.credit,
            invoiceNumber: bill1.invoiceNumber,
            netAmount: bill1.netAmount,
            financialYearEnding: bill1.financialYearEnding,
            billRun: {
              id: billRun1.id,
              batchType: billRun1.batchType,
              billRunNumber: billRun1.billRunNumber,
              scheme: billRun1.scheme,
              source: billRun1.source,
              status: billRun1.status,
              summer: billRun1.summer
            }
          }
        ],
        pagination: { total: 1 }
      })
    })
  })
})
