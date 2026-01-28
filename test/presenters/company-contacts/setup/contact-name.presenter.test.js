'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')

// Thing under test
const ContactNamePresenter = require('../../../../app/presenters/company-contacts/setup/contact-name.presenter.js')

describe('Company Contacts - Setup - Contact Name Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { company }
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
  })
})
