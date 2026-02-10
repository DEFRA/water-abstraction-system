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
      address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      companiesHouseId: '12345678'
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
            selected: true,
            text: '1 company found',
            value: 'select'
          },
          {
            selected: false,
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

  describe('"companies" property', () => {
    describe('when there is one company in the companies array', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          companiesHouseId: '12345678'
        }
      })

      it('returns the correct label', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.companies[0].text).to.equal('1 company found')
      })
    })

    describe('when there is more than one company in the companies array', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount
        }
      })

      it('returns the correct label', () => {
        const result = SelectCompanyPresenter.go(session, [...companies, ...companies])

        expect(result.companies[0].text).to.equal('2 companies found')
      })
    })
  })
})
