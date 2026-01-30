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
const ViewContactNameService = require('../../../../app/services/company-contacts/setup/view-contact-name.service.js')

describe('Company Contacts - Setup - View Contact Name Service', () => {
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
      const result = await ViewContactNameService.go(session.id)

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
  })
})
