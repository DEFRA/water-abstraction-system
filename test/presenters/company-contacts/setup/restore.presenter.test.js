'use strict'

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const RestorePresenter = require('../../../../app/presenters/company-contacts/setup/restore.presenter.js')

describe('Company Contacts - Setup - Restore Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RestorePresenter(session)

      expect(result).toEqual({
        abstractionAlerts: 'Yes',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/check`,
          text: 'Back'
        },
        email: 'eric@test.com',
        name: 'Eric',
        pageTitle: 'You are about to restore this contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
