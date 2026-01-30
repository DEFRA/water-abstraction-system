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
const ContactNamePresenter = require('../../../../app/presenters/company-contacts/setup/contact-name.presenter.js')

describe('Company Contacts - Setup - Contact Name Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactNamePresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "name" property', () => {
      describe('when the name has previously been saved', () => {
        beforeEach(() => {
          session.name = 'Eric'
        })

        it('returns the name from the session', () => {
          const result = ContactNamePresenter.go(session)

          expect(result.name).to.equal('Eric')
        })
      })

      describe('when the name has not previously been saved', () => {
        it('returns an empty string', () => {
          const result = ContactNamePresenter.go(session)

          expect(result.name).to.equal('')
        })
      })
    })

    describe('the "backLink" property', () => {
      describe('when check page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('returns the link to the "check" page', () => {
          const result = ContactNamePresenter.go(session)

          expect(result.backLink).to.equal({
            href: `/system/company-contacts/setup/${session.id}/check`,
            text: 'Back'
          })
        })
      })

      describe('when the check page has not been visited', () => {
        it('returns a link to the company "contacts" page', () => {
          const result = ContactNamePresenter.go(session)

          expect(result.backLink).to.equal({
            href: `/system/companies/${company.id}/contacts`,
            text: 'Back'
          })
        })
      })
    })
  })
})
