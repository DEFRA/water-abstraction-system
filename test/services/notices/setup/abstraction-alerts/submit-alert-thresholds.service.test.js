// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitAlertThresholdsService from '../../../../../src/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Alert Thresholds service', () => {
  let licenceMonitoringStations
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    yarStub = YarStub()

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertThresholds: [],
      alertType: 'stop'
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when first submitting the page', () => {
    beforeEach(() => {
      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    describe('and the validation succeeds', () => {
      describe('and the user has selected a single threshold', () => {
        beforeEach(() => {
          payload = { alertThresholds: licenceMonitoringStations.one.thresholdGroup }
        })

        it('saves the selected threshold as an array in the session', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(session.alertThresholds).toEqual([licenceMonitoringStations.one.thresholdGroup])
          expect(session.$update).toHaveBeenCalled()
        })

        it('does not attempt to clear the "check licence matches" filter', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(yarStub.clear).not.toHaveBeenCalled()
        })

        it('continues the journey', async () => {
          const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(result).toEqual({})
        })
      })

      describe('and the user has selected multiple thresholds', () => {
        beforeEach(() => {
          payload = {
            alertThresholds: [
              licenceMonitoringStations.one.thresholdGroup,
              licenceMonitoringStations.two.thresholdGroup
            ]
          }
        })

        it('saves the selected thresholds as an array in the session', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(session.alertThresholds).toEqual([
            licenceMonitoringStations.one.thresholdGroup,
            licenceMonitoringStations.two.thresholdGroup
          ])

          expect(session.$update).toHaveBeenCalled()
        })

        it('does not attempt to clear the "check licence matches" filter', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(yarStub.clear).not.toHaveBeenCalled()
        })

        it('continues the journey', async () => {
          const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(result).toEqual({})
        })
      })
    })

    describe('but the validation fails', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

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

      it('does not attempt to clear the "check licence matches" filter', async () => {
        await SubmitAlertThresholdsService(session.id, payload, yarStub)

        expect(yarStub.clear).not.toHaveBeenCalled()
      })
    })
  })

  describe('when re-submitting the page', () => {
    beforeEach(() => {
      sessionData.alertThresholds = [licenceMonitoringStations.one.thresholdGroup]

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    describe('and the validation succeeds', () => {
      describe('but the user has not made any changes', () => {
        beforeEach(() => {
          payload = { alertThresholds: licenceMonitoringStations.one.thresholdGroup }
        })

        it('saves the selected thresholds as an array in the session', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(session.alertThresholds).toEqual([licenceMonitoringStations.one.thresholdGroup])

          expect(session.$update).toHaveBeenCalled()
        })

        it('does not attempt to clear the "check licence matches" filter', async () => {
          await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(yarStub.clear).not.toHaveBeenCalled()
        })

        it('continues the journey', async () => {
          const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

          expect(result).toEqual({})
        })
      })

      describe('and the user has made changes', () => {
        describe('by changing the selected threshold', () => {
          beforeEach(() => {
            payload = { alertThresholds: licenceMonitoringStations.two.thresholdGroup }
          })

          it('saves the selected thresholds as an array in the session', async () => {
            await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(session.alertThresholds).toEqual([licenceMonitoringStations.two.thresholdGroup])

            expect(session.$update).toHaveBeenCalled()
          })

          it('clears the "check licence matches" filter', async () => {
            await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(yarStub.clear).toHaveBeenCalledWith(`checkLicenceMatchesFilter-${session.id}`)
          })

          it('continues the journey', async () => {
            const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(result).toEqual({})
          })
        })

        describe('by selecting an additional threshold', () => {
          beforeEach(() => {
            payload = {
              alertThresholds: [
                licenceMonitoringStations.one.thresholdGroup,
                licenceMonitoringStations.two.thresholdGroup
              ]
            }
          })

          it('saves the selected thresholds as an array in the session', async () => {
            await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(session.alertThresholds).toEqual([
              licenceMonitoringStations.one.thresholdGroup,
              licenceMonitoringStations.two.thresholdGroup
            ])

            expect(session.$update).toHaveBeenCalled()
          })

          it('clears the "check licence matches" filter', async () => {
            await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(yarStub.clear).toHaveBeenCalledWith(`checkLicenceMatchesFilter-${session.id}`)
          })

          it('continues the journey', async () => {
            const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

            expect(result).toEqual({})
          })
        })
      })
    })

    describe('but the validation fails', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertThresholdsService(session.id, payload, yarStub)

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

      it('does not attempt to clear the "check licence matches" filter', async () => {
        await SubmitAlertThresholdsService(session.id, payload, yarStub)

        expect(yarStub.clear).not.toHaveBeenCalled()
      })
    })
  })
})
