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
const CancelPresenter = require('../../../../app/presenters/company-contacts/setup/cancel.presenter.js')

describe('Company Contacts - Setup - Cancel Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter.go(session)

      expect(result).to.equal({
        abstractionAlerts: 'Yes',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/check`,
          text: 'Back'
        },
        email: 'eric@test.com',
        name: 'Eric',
        pageTitle: 'You are about to cancel this contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
