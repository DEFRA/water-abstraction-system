'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewContactEmailService = require('../../../../app/services/company-contacts/setup/view-contact-email.service.js')

describe('Company Contacts - Setup - Contact Email Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactEmailService.go(session.id)

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
  })
})
