// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAlertThresholdsService from '../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Alert Thresholds service', () => {
  let licenceMonitoringStations
  let payload
  let session
  let sessionData

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

      sessionData = {
        ...AbstractionAlertSessionData.get(licenceMonitoringStations),
        alertType: 'stop'
      }

      payload = {
        alertThresholds: [licenceMonitoringStations.one.thresholdGroup, licenceMonitoringStations.two.thresholdGroup]
      }

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitAlertThresholdsService(session.id, payload)

      expect(result).toEqual({})
    })

    describe('and updates the session ', () => {
      describe('and one threshold has been selected ', () => {
        beforeEach(() => {
          payload = {
            alertThresholds: licenceMonitoringStations.one.thresholdGroup
          }
        })

        it('saves the submitted value as an array', async () => {
          await SubmitAlertThresholdsService(session.id, payload)

          expect(session.alertThresholds).toEqual([licenceMonitoringStations.one.thresholdGroup])
          expect(session.$update.called).toBe(true)
        })
      })

      describe('and more than one threshold has been selected ', () => {
        it('saves the submitted values as an array', async () => {
          await SubmitAlertThresholdsService(session.id, payload)

          expect(session.alertThresholds).toEqual([
            licenceMonitoringStations.one.thresholdGroup,
            licenceMonitoringStations.two.thresholdGroup
          ])

          expect(session.$update.called).toBe(true)
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('and there are no previous "alertThresholds"', () => {
      beforeEach(() => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertThresholdsService(session.id, payload)

        expect(result).toEqual({
          error: {
            alertThresholds: {
              text: 'Select applicable threshold(s)'
            },
            errorList: [
              {
                href: '#alertThresholds',
                text: 'Select applicable threshold(s)'
              }
            ]
          },
          backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`, text: 'Back' },
          pageTitleCaption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
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

    describe('and there are previous "alertThresholds"', () => {
      beforeEach(() => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

        payload = {}
      })

      it('returns page data for the view, with errors, and all the thresholds unselected', async () => {
        const result = await SubmitAlertThresholdsService(session.id, payload)

        expect(result).toEqual({
          error: {
            alertThresholds: {
              text: 'Select applicable threshold(s)'
            },
            errorList: [
              {
                href: '#alertThresholds',
                text: 'Select applicable threshold(s)'
              }
            ]
          },
          backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`, text: 'Back' },
          pageTitleCaption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
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
})
