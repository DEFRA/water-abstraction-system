'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/company-contacts/setup/check.presenter.js')

describe('Company Contacts - Setup - Check Presenter', () => {
  let company
  let companyContact
  let companyContacts
  let email
  let name
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()
    companyContact = CustomersFixtures.companyContact()

    companyContact.contact.contactType = 'department'

    companyContacts = [companyContact]

    name = companyContact.contact.department
    email = companyContact.contact.email

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name, email }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, companyContacts)

      expect(result).to.equal({
        abstractionAlerts: 'Yes',
        email,
        links: {
          abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          cancel: `/system/company-contacts/setup/${session.id}/cancel`,
          email: `/system/company-contacts/setup/${session.id}/contact-email`,
          name: `/system/company-contacts/setup/${session.id}/contact-name`
        },
        name,
        pageTitle: 'Check contact',
        pageTitleCaption: 'Tyrell Corporation',
        warning: {
          iconFallbackText: 'Warning',
          text: 'A contact with this name and email already exist. Change the name or email, or cancel.'
        }
      })
    })

    describe('the "warning" property', () => {
      describe('when creating a new company contact', () => {
        describe('and the contact already exists (name and email match)', () => {
          it('returns the warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.equal({
              text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
              iconFallbackText: 'Warning'
            })
          })
        })

        describe('and the contact does not exist (name and email do not match)', () => {
          beforeEach(() => {
            session.name = 'Eric'
            session.email = 'Eric@test.com'
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.be.null()
          })
        })
      })

      describe('when editing an existing company contact', () => {
        describe('and the contact already exists (name and email match) and is not the editing company contact', () => {
          beforeEach(() => {
            session.companyContact = companyContact

            companyContacts = [
              {
                ...companyContact,
                id: generateUUID()
              }
            ]
          })

          it('returns the warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.equal({
              text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
              iconFallbackText: 'Warning'
            })
          })
        })

        describe('and the contact already exists (name and email exist) and is the editing company contact', () => {
          beforeEach(() => {
            session.companyContact = companyContact
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.null()
          })
        })

        describe('and the contact does not exist (name and email do not match)', () => {
          beforeEach(() => {
            session.name = 'Eric'
            session.email = 'Eric@test.com'
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.be.null()
          })
        })
      })

      describe('when the user has entered the same data in a different case "TYRELL CORPORATION"', () => {
        beforeEach(() => {
          session.name = companyContact.contact.department.toUpperCase()
        })

        it('returns the warning', () => {
          const result = CheckPresenter.go(session, companyContacts)

          expect(result.warning).to.equal({
            text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
            iconFallbackText: 'Warning'
          })
        })
      })
    })
  })
})
