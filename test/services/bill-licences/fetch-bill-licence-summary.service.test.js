'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const { closeConnection } = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Thing under test
const FetchBillLicenceSummaryService = require('../../../app/services/bill-licences/fetch-bill-licence-summary.service.js')

describe('Fetch Bill Licence Summary service', () => {
  let accountNumber
  let agentCompanyId
  let billId
  let billingAccountId
  let billingAccountAddressId
  let billLicence
  let billRunId
  let companyId
  let contactId
  let licenceRef
  let regionId
  let transactionId

  beforeEach(async () => {
    const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

    regionId = region.id
    licenceRef = LicenceHelper.generateLicenceRef()

    const company = await CompanyHelper.add()

    companyId = company.id

    const billingAccount = await BillingAccountHelper.add({ companyId })

    billingAccountId = billingAccount.id
    accountNumber = billingAccount.accountNumber

    const agentCompany = await CompanyHelper.add({ name: 'Agent Company Ltd' })

    agentCompanyId = agentCompany.id

    const contact = await ContactHelper.add()

    contactId = contact.id

    const billingAccountAddress = await BillingAccountAddressHelper.add({
      billingAccountId,
      companyId: agentCompanyId,
      contactId,
      endDate: null
    })

    billingAccountAddressId = billingAccountAddress.id

    const billRun = await BillRunHelper.add({
      billRunNumber: 1075,
      createdAt: new Date('2023-05-01'),
      status: 'ready',
      regionId
    })

    billRunId = billRun.id

    const bill = await BillHelper.add({ accountNumber, billingAccountId, billRunId })

    billId = bill.id

    billLicence = await BillLicenceHelper.add({ billId, licenceRef })

    const transaction = await TransactionHelper.add({ billLicenceId: billLicence.id, netAmount: 1000.1 })

    transactionId = transaction.id
  })

  after(async () => {
    await closeConnection()
  })

  describe('when a bill licence with a matching ID exists', () => {
    it('will fetch the data use in the remove bill licence page', async () => {
      const result = await FetchBillLicenceSummaryService.go(billLicence.id)

      // NOTE: Transactions would not ordinarily be empty. But the format of the transactions will differ depending on
      // scheme so we get into that in later tests.
      expect(result).to.equal({
        id: billLicence.id,
        licenceId: billLicence.licenceId,
        licenceRef,
        bill: {
          id: billId,
          accountNumber,
          billingAccount: {
            id: billingAccountId,
            accountNumber,
            company: {
              id: companyId,
              name: 'Example Trading Ltd',
              type: 'organisation'
            },
            billingAccountAddresses: [
              {
                id: billingAccountAddressId,
                company: {
                  id: agentCompanyId,
                  name: 'Agent Company Ltd',
                  type: 'organisation'
                },
                contact: {
                  id: contactId,
                  contactType: 'person',
                  dataSource: 'wrls',
                  department: null,
                  firstName: 'Amara',
                  initials: null,
                  lastName: 'Gupta',
                  middleInitials: null,
                  salutation: null,
                  suffix: null
                }
              }
            ]
          },
          billRun: {
            id: billRunId,
            batchType: 'supplementary',
            billRunNumber: 1075,
            createdAt: new Date('2023-05-01'),
            scheme: 'sroc',
            source: 'wrls',
            status: 'ready',
            toFinancialYearEnding: 2023,
            region: {
              id: regionId,
              displayName: 'Test Region'
            }
          }
        },
        transactions: [
          {
            id: transactionId,
            credit: false,
            netAmount: 1000.1
          }
        ]
      })
    })
  })

  describe('when a bill licence with a matching ID does not exist', () => {
    it('returns no result', async () => {
      const result = await FetchBillLicenceSummaryService.go('93112100-152b-4860-abea-2adee11dcd69')

      expect(result).to.be.undefined()
    })
  })
})
