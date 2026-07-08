// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAlertTypeService from '../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-type.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Alert Type service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = { alertType: 'stop' }
    sessionData = AbstractionAlertSessionData.get()

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('when the "alertType" has not been previously set', () => {
      it('saves the submitted value', async () => {
        await SubmitAlertTypeService(session.id, payload)

        expect(session.alertType).toEqual('stop')
        expect(session.$update.called).toBe(true)
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitAlertTypeService(session.id, payload)

        expect(result).toEqual({})
      })
    })

    describe('when the user selects a different "alertType" to a previous selection', () => {
      beforeEach(() => {
        sessionData.alertType = 'resume'
        sessionData.removedThresholds = ['123']

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('sets the "alertThresholds" to an empty array', async () => {
        await SubmitAlertTypeService(session.id, payload)

        expect(session.alertThresholds).toEqual([])
        expect(session.$update.called).toBe(true)
      })

      it('sets the "removedThresholds" to an empty array', async () => {
        await SubmitAlertTypeService(session.id, payload)

        expect(session.removedThresholds).toEqual([])
        expect(session.$update.called).toBe(true)
      })
    })

    describe('when the user selects the same "alertType" they previously selected', () => {
      beforeEach(() => {
        sessionData.alertType = 'stop'
        sessionData.alertThresholds = ['100-flow']

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('does not change the existing "alertThresholds"', async () => {
        await SubmitAlertTypeService(session.id, payload)

        expect(session.alertThresholds).toEqual(['100-flow'])
        expect(session.$update.called).toBe(true)
      })
    })
  })

  describe('when validation fails', () => {
    describe('and no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertTypeService(session.id, payload)

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
          error: {
            alertType: {
              text: 'Select the type of alert you need to send'
            },
            errorList: [
              {
                href: '#alertType',
                text: 'Select the type of alert you need to send'
              }
            ]
          },
          pageTitle: 'Select the type of alert you need to send',
          pageTitleCaption: 'Death star'
        })
      })
    })

    describe('and "stop" or "reduce" have been selected but no thresholds have that alert type', () => {
      beforeEach(() => {
        payload = { alertType: 'stop' }

        sessionData.licenceMonitoringStations = [
          {
            ...sessionData.licenceMonitoringStations[0],
            restrictionType: 'warning'
          }
        ]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view, with errors (and the selected alert type checked)', async () => {
        const result = await SubmitAlertTypeService(session.id, payload)

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
              checked: true,
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
          error: {
            alertType: {
              text: 'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
            },
            errorList: [
              {
                href: '#alertType',
                text: 'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
              }
            ]
          },
          pageTitle: 'Select the type of alert you need to send',
          pageTitleCaption: 'Death star'
        })
      })
    })
  })
})
