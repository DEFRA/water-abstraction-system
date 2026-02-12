'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const SelectCompanyPresenter = require('../../../../app/presenters/billing-accounts/setup/select-company.presenter.js')

describe('Billing Accounts - Setup - Select Company Presenter', () => {
  const companies = [
    {
      address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      companiesHouseId: '12345678',
      title: 'ENVIRONMENT AGENCY'
    }
  ]

  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = SelectCompanyPresenter.go(session, companies)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/company-search`,
          text: 'Back'
        },
        companies: [
          {
            checked: false,
            id: companies[0].companiesHouseId,
            hint: { text: companies[0].address },
            text: companies[0].title,
            value: companies[0].companiesHouseId
          }
        ],
        companiesHouseId: null,
        pageTitle: 'Select the registered company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('"companiesHouseId" property', () => {
    describe('when there is a companiesHouseId in the session', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          companiesHouseId: '12345678'
        }
      })

      it('returns the correct value', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.companiesHouseId).to.equal(session.companiesHouseId)
      })
    })

    describe('when there is no companiesHouseId in the session', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }
      })

      it('returns null', () => {
        const result = SelectCompanyPresenter.go(session, [])

        expect(result.companiesHouseId).to.equal(null)
      })
    })
  })
})
