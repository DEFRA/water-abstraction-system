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
const ViewCheckService = require('../../../../app/services/company-contacts/setup/view-check.service.js')

describe('Company Contacts - Setup - Check Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        abstractionAlerts: 'Yes',
        email: 'eric@test.com',
        name: 'Eric',
        pageTitle: 'Check contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
