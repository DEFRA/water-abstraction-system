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
const AbstractionAlertsPresenter = require('../../../../app/presenters/company-contacts/setup/abstraction-alerts.presenter.js')

describe('Company Contacts - Setup - Abstraction Alerts Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AbstractionAlertsPresenter.go(session)

      expect(result).to.equal({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,
          text: 'Back'
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('when the "abstractionAlerts" has previously been saved', () => {
        beforeEach(() => {
          session.abstractionAlerts = 'yes'
        })

        it('returns the "abstractionAlerts" from the session', () => {
          const result = AbstractionAlertsPresenter.go(session)

          expect(result.abstractionAlerts).to.equal('yes')
        })
      })

      describe('when the "abstractionAlerts" has not previously been saved', () => {
        it('returns null', () => {
          const result = AbstractionAlertsPresenter.go(session)

          expect(result.abstractionAlerts).to.be.null()
        })
      })
    })
  })
})
