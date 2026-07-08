'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const AbstractionAlertSessionData = require('../../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCancelAlertsService = require('../../../../../app/services/notices/setup/abstraction-alerts/view-cancel-alerts.service.js')

describe('Notices - Setup - Abstraction Alerts - View Cancel Alerts service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      ...AbstractionAlertSessionData.get(),
      alertType: 'resume'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelAlertsService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          text: 'Back'
        },
        pageTitle: 'You are about to cancel this alert',
        pageTitleCaption: 'Death star',
        summaryList: {
          text: 'Alert type',
          value: 'Resume'
        }
      })
    })
  })
})
