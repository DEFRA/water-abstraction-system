'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { licence } = require('../../../support/fixtures/licence.fixture.js')

// Thing under test
const CancelPresenter = require('../../../../app/presenters/company-contacts/setup/cancel.presenter.js')

describe('Company Contacts - Setup - Cancel Presenter', () => {
  let company
  let licences
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    licences = [licence()]

    session = {
      abstractionAlertLicences: null,
      abstractionAlerts: 'yes',
      company,
      email: 'eric@test.com',
      id: generateUUID(),
      licences,
      name: 'Eric'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter.go(session)

      expect(result).to.equal({
        abstractionAlertsLabel: 'Yes, for all licences',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/check`,
          text: 'Back'
        },
        email: 'eric@test.com',
        licences: [],
        name: 'Eric',
        pageTitle: 'You are about to cancel this contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('and the company contact is being edited', () => {
      beforeEach(() => {
        session.companyContact = { id: generateUUID() }
      })

      it('returns page data for the view', () => {
        const result = CancelPresenter.go(session)

        expect(result.pageTitle).to.equal('You are about to cancel editing this contact')
      })
    })
  })
})
