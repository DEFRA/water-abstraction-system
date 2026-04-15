'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCancelService = require('../../../../app/services/company-contacts/setup/view-cancel.service.js')

describe('Company Contacts - Setup - Cancel Service', () => {
  let company
  let session
  let sessionData

  beforeEach(() => {
    company = CustomersFixtures.company()

    sessionData = { company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelService.go(session.id)

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
