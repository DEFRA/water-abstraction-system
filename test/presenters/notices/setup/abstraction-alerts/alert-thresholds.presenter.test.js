// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from 'water-abstraction-engine/test/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import AlertThresholdsPresenter from '../../../../../src/presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js'

describe('Notices - Setup - Abstraction Alerts - Alert Thresholds presenter', () => {
  let licenceMonitoringStations
  let session

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    session = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertType: 'stop'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertThresholdsPresenter(session)

      expect(result).toEqual({
        backLink: { href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`, text: 'Back' },
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

    describe('the "thresholdOptions" property', () => {
      describe('when there are already selected thresholds', () => {
        beforeEach(() => {
          session.alertThresholds = [licenceMonitoringStations.two.thresholdGroup]
        })

        it('returns page data for the view, with the thresholds checked', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: true,
              hint: { text: 'Flow threshold' },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            }
          ])
        })
      })

      describe('and the "alertType" is "stop" ', () => {
        beforeEach(() => {
          session.alertType = 'stop'
        })

        it('returns page data for the view, with only the thresholds with stop restrictions', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            }
          ])
        })

        describe('and a licence monitoring station is "stop_or_reduce" ', () => {
          beforeEach(() => {
            licenceMonitoringStations.one.restrictionType = 'reduce'
            licenceMonitoringStations.two.restrictionType = 'stop'
            licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'

            session = {
              ...AbstractionAlertSessionData.get(licenceMonitoringStations),
              alertType: 'stop'
            }
          })

          it('returns page data for the view, with only the thresholds with stop restrictions', () => {
            const result = AlertThresholdsPresenter(session)

            expect(result.thresholdOptions).toEqual([
              {
                checked: false,
                hint: { text: 'Flow threshold' },
                text: '100m3/s',
                value: licenceMonitoringStations.two.thresholdGroup
              }
            ])
          })
        })
      })

      describe('and the "alertType" is "reduce" ', () => {
        beforeEach(() => {
          session.alertType = 'reduce'
        })

        it('returns page data for the view, with only the thresholds with reduce restrictions', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '1000m',
              value: licenceMonitoringStations.one.thresholdGroup
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '100m',
              value: licenceMonitoringStations.three.thresholdGroup
            }
          ])
        })

        describe('and a licence monitoring station is "stop_or_reduce" ', () => {
          beforeEach(() => {
            licenceMonitoringStations.one.restrictionType = 'reduce'
            licenceMonitoringStations.two.restrictionType = 'stop'
            licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'

            session = {
              ...AbstractionAlertSessionData.get(licenceMonitoringStations),
              alertType: 'reduce'
            }
          })

          it('returns page data for the view, with only the thresholds with "reduce" and "stop_or_reduce" restrictions', () => {
            const result = AlertThresholdsPresenter(session)

            expect(result.thresholdOptions).toEqual([
              // reduce
              {
                checked: false,
                hint: { text: 'Level threshold' },
                text: '1000m',
                value: licenceMonitoringStations.one.thresholdGroup
              },
              // stop_or_reduce
              {
                checked: false,
                hint: { text: 'Level threshold' },
                text: '100m',
                value: licenceMonitoringStations.three.thresholdGroup
              }
            ])
          })
        })
      })

      describe('and the alert type is not "stop" or "reduce"', () => {
        beforeEach(() => {
          // This could be 'resume' or 'warning'
          delete session.alertType
        })

        it('returns page data for the view, with all the thresholds', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '1000m',
              value: licenceMonitoringStations.one.thresholdGroup
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '100m',
              value: licenceMonitoringStations.three.thresholdGroup
            }
          ])
        })
      })

      describe('and thresholds have been removed', () => {
        beforeEach(() => {
          // This could be 'resume' or 'warning'
          delete session.alertType

          session.removedThresholds = [licenceMonitoringStations.one.id]
        })

        it('returns page data for the view, without the removed thresholds', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '100m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '100m',
              value: licenceMonitoringStations.three.thresholdGroup
            }
          ])
        })
      })

      describe('when there are multiple different thresholds all with different types and measurement quantities', () => {
        beforeEach(() => {
          licenceMonitoringStations = AbstractionAlertSessionData.unsortedLicenceMonitoringStations()

          session = {
            ...AbstractionAlertSessionData.get(licenceMonitoringStations)
          }
        })

        it('sorts relevant thresholds first by flow/level alphabetically then by measurement quantity', () => {
          const result = AlertThresholdsPresenter(session)

          expect(result.thresholdOptions).toEqual([
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '100m3/s',
              value: 'flow-100-m3/s'
            },
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '1Mgpd',
              value: 'flow-1-Mgpd'
            },
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '10l/s',
              value: 'flow-10-l/s'
            },
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '0.5Ml/d',
              value: 'flow-0.5-Ml/d'
            },
            {
              checked: false,
              hint: { text: 'Flow threshold' },
              text: '5000gpd',
              value: 'flow-5000-gpd'
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '1000m',
              value: 'level-1000-m'
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '100m',
              value: 'level-100-m'
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '50SLD',
              value: 'level-50-SLD'
            },
            {
              checked: false,
              hint: { text: 'Level threshold' },
              text: '2mBOD',
              value: 'level-2-mBOD'
            }
          ])
        })
      })
    })
  })
})
