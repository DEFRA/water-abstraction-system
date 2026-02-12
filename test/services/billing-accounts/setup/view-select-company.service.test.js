'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchCompaniesService = require('../../../../app/services/billing-accounts/setup/fetch-companies.service.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewSelectCompanyService = require('../../../../app/services/billing-accounts/setup/view-select-company.service.js')

describe('Billing Accounts - Setup - View Select Company Service', () => {
  const companies = [
    {
      address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      companiesHouseId: '12345678'
    }
  ]

  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
    Sinon.stub(FetchCompaniesService, 'go').returns(companies)
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectCompanyService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/company-search`,
          text: 'Back'
        },
        companies: [
          {
            checked: false,
            id: '12345678',
            text: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
            value: '12345678'
          }
        ],
        companiesHouseId: null,
        pageTitle: 'Select the registered company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
