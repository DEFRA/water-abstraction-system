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
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companies = [
    {
      address: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      number: '12345678',
      title: 'ENVIRONMENT AGENCY'
    }
  ]

  let session

  beforeEach(() => {
    session = {
      billingAccount,
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
            id: companies[0].number,
            hint: { text: companies[0].address },
            text: companies[0].title,
            value: companies[0].number
          }
        ],
        companiesHouseNumber: null,
        pageTitle: 'Select the registered company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "backLink.href" property', () => {
    describe('when there "checkPageVisited" is "true"', () => {
      beforeEach(() => {
        session.checkPageVisited = true
        session.existingAccount = generateUUID()
      })

      it('returns the link for the "check" page', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('when there "checkPageVisited" is "false"', () => {
      beforeEach(() => {
        session.checkPageVisited = false
        session.accountType = 'company'
      })

      it('returns the link for the "account" page', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/company-search`)
      })
    })
  })

  describe('"companiesHouseNumber" property', () => {
    describe('when there is a companiesHouseNumber in the session', () => {
      beforeEach(() => {
        session = {
          billingAccount,
          companiesHouseNumber: '12345678'
        }
      })

      it('returns the correct value', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.companiesHouseNumber).to.equal(session.companiesHouseNumber)
      })
    })

    describe('when there is no companiesHouseNumber in the session', () => {
      beforeEach(() => {
        session = {
          billingAccount
        }
      })

      it('returns null', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.companiesHouseNumber).to.equal(null)
      })
    })
  })

  describe('"companies" property', () => {
    describe('when there are companies found', () => {
      beforeEach(() => {
        session = {
          billingAccount
        }
      })

      it('returns an array of radio options', () => {
        const result = SelectCompanyPresenter.go(session, companies)

        expect(result.companies).to.equal([
          {
            id: companies[0].number,
            hint: {
              text: companies[0].address
            },
            text: companies[0].title,
            value: companies[0].number,
            checked: false
          }
        ])
      })
    })

    describe('when there are no companies found', () => {
      beforeEach(() => {
        session = {
          billingAccount
        }
      })

      it('returns an empty array', () => {
        const result = SelectCompanyPresenter.go(session, [])

        expect(result.companies).to.equal([])
      })
    })
  })
})
