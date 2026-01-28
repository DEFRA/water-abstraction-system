'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../support/fixtures/billing-accounts.fixtures.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchViewBillingAccountService = require('../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

// Thing under test
const ViewBillingAccountService = require('../../../app/services/billing-accounts/view-billing-account.service.js')

describe('Billing Accounts - View Billing Account service', () => {
  let billingAccountData
  let chargeVersionId
  let companyId
  let licenceId

  beforeEach(() => {
    billingAccountData = BillingAccountsFixture.billingAccount()

    chargeVersionId = generateUUID()
    companyId = generateUUID()
    licenceId = generateUUID()

    Sinon.stub(FetchViewBillingAccountService, 'go').returns(billingAccountData)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a billing account with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewBillingAccountService.go(
        billingAccountData.billingAccount.id,
        1,
        licenceId,
        chargeVersionId,
        companyId
      )

      expect(result).to.equal({
        activeNavBar: 'search',
        address: [
          'Ferns Surfacing Limited',
          'Test Testingson',
          'Tutsham Farm',
          'West Farleigh',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ],
        backLink: {
          title: 'Go back to charge information',
          href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`
        },
        billingAccountId: billingAccountData.billingAccount.id,
        bills: [
          {
            billId: billingAccountData.bills[0].id,
            billNumber: 'Zero value bill',
            billRunNumber: 607,
            billRunType: 'Annual',
            billTotal: '£103.84',
            dateCreated: '14 December 2023',
            financialYear: 2021
          }
        ],
        createdDate: '14 December 2023',
        customerFile: null,
        lastUpdated: null,
        pageTitle: 'Billing account for Ferns Surfacing Limited',
        pagination: { numberOfPages: 1, showingMessage: 'Showing all 1 bills' },
        pageTitleCaption: `Billing account ${billingAccountData.billingAccount.accountNumber}`
      })
    })
  })
})
