'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const ContactDetailsPresenter = require('../../../app/presenters/company-contacts/contact-details.presenter.js')

describe('Company Contacts - Contact Details presenter', () => {
  let companyContact
  let company

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactDetailsPresenter.go(company, companyContact)

      expect(result).to.equal({
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
      })
    })

    describe('the "contact" property', () => {
      describe('the "created" property', () => {
        describe('when there is "createdByUser"', () => {
          it('returns the created text with the created at date and the created by username', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.contact.created).to.equal('1 January 2022 by nexus6.hunter@offworld.net')
          })
        })

        describe('when there is no "createdByUser"', () => {
          beforeEach(() => {
            companyContact.createdByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.contact.created).to.equal('1 January 2022')
          })
        })
      })

      describe('the "abstractionAlerts" property', () => {
        describe('when the contact is an additional contact', () => {
          it('returns true', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.additionalContact).to.be.true()
          })
        })

        describe('when the contact is not an additional contact', () => {
          beforeEach(() => {
            companyContact.licenceRole.name = 'licenceHolder'
          })

          it('returns false', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.additionalContact).to.be.false()
          })
        })
      })

      describe('the "lastUpdated" property', () => {
        describe('when there is "updatedByUser"', () => {
          it('returns the created text with the updated at date and the updated by username', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.contact.lastUpdated).to.equal('1 January 2022 by void.kampff@tyrell.com')
          })
        })

        describe('when there is no "updatedByUser"', () => {
          beforeEach(() => {
            companyContact.updatedByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ContactDetailsPresenter.go(company, companyContact)

            expect(result.contact.lastUpdated).to.equal('1 January 2022')
          })
        })
      })
    })
  })
})
