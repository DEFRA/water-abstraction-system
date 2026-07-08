// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCancelAlertsService from '../../../../../app/services/notices/setup/abstraction-alerts/view-cancel-alerts.service.js'

describe('Notices - Setup - Abstraction Alerts - View Cancel Alerts service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      ...AbstractionAlertSessionData.get(),
      alertType: 'resume'
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
