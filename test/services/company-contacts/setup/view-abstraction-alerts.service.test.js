'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAbstractionAlertsService = require('../../../../app/services/company-contacts/setup/view-abstraction-alerts.service.js')

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, licences: [] }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAbstractionAlertsService.go(session.id)

      expect(result).toEqual({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,
          text: 'Back'
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation',
        showSomeLicences: false
      })
    })
  })
})
