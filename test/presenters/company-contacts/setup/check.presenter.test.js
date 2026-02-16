'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/company-contacts/setup/check.presenter.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

describe('Company Contacts - Setup - Check Presenter', () => {
  let company
  let companyContact
  let companyContacts
  let email
  let name
  let session

  beforeEach(() => {
    name = 'Eric'
    email = 'eric@test.com'

    company = CustomersFixtures.company()

    companyContact = CustomersFixtures.companyContact()

    companyContacts = [companyContact]

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
        warning: null
      })
    })

    describe('the "warning" property', () => {
      describe('when the contact already exists (name and email exist)', () => {
        beforeEach(() => {
          companyContact.contact.department = name
          companyContact.contact.email = email

          companyContacts = [companyContact]
        })

        it('return the warning', () => {
          const result = CheckPresenter.go(session, companyContacts)

          expect(result.warning).to.equal({
            text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
            iconFallbackText: 'Warning'
          })
        })

        describe('and the user has entered the same data in a different case "TYRELL CORPORATION"', () => {
          beforeEach(() => {
            companyContact.contact.department = name.toUpperCase()
            companyContact.contact.email = email.toUpperCase()

            companyContacts = [companyContact]
          })

          it('return the warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.equal({
              text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
              iconFallbackText: 'Warning'
            })
          })
        })
      })

      describe('when the contact does not exist (name and email do not match)', () => {
        it('returns no warning', () => {
          const result = CheckPresenter.go(session, companyContacts)

          expect(result.warning).to.be.null()
        })
      })
    })
  })
})
