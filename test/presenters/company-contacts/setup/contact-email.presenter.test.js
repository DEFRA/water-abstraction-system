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
const ContactEmailPresenter = require('../../../../app/presenters/company-contacts/setup/contact-email.presenter.js')

describe('Company Contacts - Setup - Contact Email Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company }
  })
  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactEmailPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-name`,
          text: 'Back'
        },
        email: '',
        pageTitle: 'Enter an email address for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "email" property', () => {
      describe('when the email has previously been saved', () => {
        beforeEach(() => {
          session.email = 'eric@test.com'
        })

        it('returns the email from the session', () => {
          const result = ContactEmailPresenter.go(session)

          expect(result.email).to.equal('eric@test.com')
        })
      })

      describe('when the email has not previously been saved', () => {
        it('returns an empty string', () => {
          const result = ContactEmailPresenter.go(session)

          expect(result.email).to.equal('')
        })
      })
    })
  })
})
