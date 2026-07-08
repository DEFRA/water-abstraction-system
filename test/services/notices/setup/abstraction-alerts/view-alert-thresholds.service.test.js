// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewAlertThresholdsService from '../../../../../app/services/notices/setup/abstraction-alerts/view-alert-thresholds.service.js'

describe('Notices - Setup - Abstraction Alerts - View Alert Thresholds service', () => {
  let session
  let sessionData
  let licenceMonitoringStations

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertType: 'stop'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertThresholdsService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
          text: 'Back'
        },
        pageTitle: 'Which thresholds do you need to send an alert for?',
        pageTitleCaption: 'Death star',
        thresholdOptions: [
          {
            checked: false,
            hint: {
              text: 'Flow threshold'
            },
            text: '100m3/s',
            value: licenceMonitoringStations.two.thresholdGroup
          }
        ]
      })
    })
  })
})
