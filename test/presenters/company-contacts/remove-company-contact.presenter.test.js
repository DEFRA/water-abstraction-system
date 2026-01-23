'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const RemoveCompanyContactPresenter = require('../../../app/presenters/company-contacts/remove-company-contact.presenter.js')

describe('Company Contacts - Remove Company Contact Presenter', () => {
  let abstractionAlertsCount
  let companyContact
  let company

  beforeEach(() => {
    abstractionAlertsCount = 0

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RemoveCompanyContactPresenter.go(company, companyContact, abstractionAlertsCount)

      expect(result).to.equal({
        backLink: {
          href: `/system/company-contacts/${companyContact.id}`,
          text: 'Go back to contact details'
        },
        contact: {
          abstractionAlerts: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          name: 'Rachael Tyrell'
        },
        pageTitle: "You're about to remove this contact",
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "warning" property', () => {
      describe('when the "companyContact" is marked for "abstractionAlerts"', () => {
        describe('and the "abstractionAlertsCount" is 1', () => {
          beforeEach(() => {
            abstractionAlertsCount = 1

            companyContact.abstractionAlerts = true
          })

          it('returns the warning', () => {
            const result = RemoveCompanyContactPresenter.go(company, companyContact, abstractionAlertsCount)

            expect(result.warning).to.equal({
              iconFallbackText: 'Warning',
              text: 'Removing this contact means the licence holder will receive future water abstraction alerts by post.'
            })
          })
        })

        describe('and the "abstractionAlertsCount" is greater than 1', () => {
          beforeEach(() => {
            abstractionAlertsCount = 2

            companyContact.abstractionAlerts = true
          })

          it('does not return the warning', () => {
            const result = RemoveCompanyContactPresenter.go(company, companyContact, abstractionAlertsCount)

            expect(result.warning).to.be.undefined()
          })
        })
      })

      describe('when the "companyContact" is not marked for "abstractionAlerts"', () => {
        beforeEach(() => {
          abstractionAlertsCount = 1

          companyContact.abstractionAlerts = false
        })

        it('does not return the warning', () => {
          const result = RemoveCompanyContactPresenter.go(company, companyContact, abstractionAlertsCount)

          expect(result.warning).to.be.undefined()
        })
      })
    })
  })
})
