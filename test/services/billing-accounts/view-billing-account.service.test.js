'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../fixtures/billing-accounts.fixtures.js')

// Things we need to stub
const FetchViewBillingAccountService = require('../../../app/services/billing-accounts/fetch-view-billing-account.service.js')

// Thing under test
const ViewBillingAccountService = require('../../../app/services/billing-accounts/view-billing-account.service.js')

describe('View Billing Account service', () => {
  beforeEach(() => {
    Sinon.stub(FetchViewBillingAccountService, 'go').returns(BillingAccountsFixture.billingAccount())
  })

  describe('when a billing account with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewBillingAccountService.go(
        '64d7fc10-f046-4444-ba32-bb917dd8cde6',
        1,
        '53325713-1364-4f6b-a244-8771a36a1248',
        '6e2cbd57-81d6-4653-a063-c93bae4fe6ee'
      )

      expect(result).to.equal({
        activeNavBar: 'search',
        accountNumber: 'S88897992A',
        address: [
          'Ferns Surfacing Limited',
          'FAO Test Testingson',
          'Tutsham Farm',
          'West Farleigh',
          'Maidstone',
          'Kent',
          'ME15 0NE'
        ],
        backLink: {
          title: 'Go back to charge information',
          link: `/licences/53325713-1364-4f6b-a244-8771a36a1248/charge-information/6e2cbd57-81d6-4653-a063-c93bae4fe6ee/view`
        },
        billingAccountId: '9b03843e-848b-497e-878e-4a6628d4f683',
        bills: [
          {
            billId: '3d1b5d1f-9b57-4a28-bde1-1d57cd77b203',
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
        pagination: { numberOfPages: 1 }
      })
    })
  })
})
