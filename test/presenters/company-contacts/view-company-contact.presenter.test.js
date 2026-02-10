'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const ViewCompanyContactPresenter = require('../../../app/presenters/company-contacts/view-company-contact.presenter.js')

describe('Company Contacts - View Company Contact presenter', () => {
  let companyContact
  let company

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewCompanyContactPresenter.go(company, companyContact)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          name: 'Rachael Tyrell'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
      })
    })

    describe('the "contact" property', () => {
      describe('the "created" property', () => {
        describe('when there is "createdByUser"', () => {
          it('returns the created text with the created at date and the created by username', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact)

            expect(result.contact.created).to.equal('1 January 2022 by nexus6.hunter@offworld.net')
          })
        })

        describe('when there is no "createdByUser"', () => {
          beforeEach(() => {
            companyContact.createdByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact)

            expect(result.contact.created).to.equal('1 January 2022')
          })
        })
      })

      describe('the "lastUpdated" property', () => {
        describe('when there is "updatedByUser"', () => {
          it('returns the created text with the updated at date and the updated by username', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact)

            expect(result.contact.lastUpdated).to.equal('1 January 2022 by void.kampff@tyrell.com')
          })
        })

        describe('when there is no "updatedByUser"', () => {
          beforeEach(() => {
            companyContact.updatedByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact)

            expect(result.contact.lastUpdated).to.equal('1 January 2022')
          })
        })
      })
    })
  })
})
