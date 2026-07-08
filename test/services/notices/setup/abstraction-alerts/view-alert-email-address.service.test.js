'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const AbstractionAlertSessionData = require('../../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAlertEmailAddressService = require('../../../../../app/services/notices/setup/abstraction-alerts/view-alert-email-address.service.js')

describe('Notices - Setup - Abstraction Alerts - View Alert Email Address service', () => {
  let auth
  let session
  let sessionData

  beforeEach(() => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    sessionData = AbstractionAlertSessionData.get()
    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertEmailAddressService(session.id, auth)

      expect(result).toEqual({
        activeNavBar: 'notices',
        alertEmailAddressOptions: {
          otherUserChecked: false,
          otherUserEmailAddressInput: '',
          usernameChecked: false
        },
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          text: 'Back'
        },
        pageTitle: 'Select an email address to include in the alerts',
        pageTitleCaption: 'Death star',
        username: 'admin@defra.gov.uk'
      })
    })
  })
})
