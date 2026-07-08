// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewAlertTypeService from '../../../../../app/services/notices/setup/abstraction-alerts/view-alert-type.service.js'

describe('Notices Setup - Setup - Abstraction Alerts - View Alert Type service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = AbstractionAlertSessionData.get()
    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertTypeService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        alertTypeOptions: [
          {
            checked: false,
            hint: {
              text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
            },
            text: 'Warning',
            value: 'warning'
          },
          {
            checked: false,
            hint: {
              text: 'Tell licence holders they can take water at a reduced amount.'
            },
            text: 'Reduce',
            value: 'reduce'
          },
          {
            checked: false,
            hint: {
              text: 'Tell licence holders they must stop taking water.'
            },
            text: 'Stop',
            value: 'stop'
          },
          {
            checked: false,
            hint: {
              text: 'Tell licence holders they can take water at the normal amount.'
            },
            text: 'Resume',
            value: 'resume'
          }
        ],
        backLink: { href: `/system/monitoring-stations/${sessionData.monitoringStationId}`, text: 'Back' },
        pageTitle: 'Select the type of alert you need to send',
        pageTitleCaption: 'Death star'
      })
    })
  })
})
