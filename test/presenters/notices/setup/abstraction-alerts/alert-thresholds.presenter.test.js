'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const AlertThresholdsPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/alert-thresholds.presenter.js')

describe('Notices Setup - Abstraction Alerts - Alert Thresholds Presenter', () => {
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
      const result = AlertThresholdsPresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
        caption: 'Death star',
        pageTitle: 'Which thresholds do you need to send an alert for?',
        thresholdOptions: [
          {
            checked: false,
            hint: {
              text: 'Flow threshold'
            },
            text: '100 m3/s',
            value: licenceMonitoringStations.two.thresholdGroup
          },
          {
            checked: false,
            hint: {
              text: 'Level threshold'
            },
            text: '100 m',
            value: licenceMonitoringStations.three.thresholdGroup
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
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: true,
              value: licenceMonitoringStations.two.thresholdGroup,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStations.three.thresholdGroup,
              text: '100 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })
      })

      describe('and the "alertType" is "stop" ', () => {
        beforeEach(() => {
          session.alertType = 'stop'
        })

        it('returns page data for the view, with only the thresholds with stop restrictions', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStations.two.thresholdGroup,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStations.three.thresholdGroup,
              text: '100 m',
              hint: { text: 'Level threshold' }
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
            const result = AlertThresholdsPresenter.go(session)

            expect(result.thresholdOptions).to.equal([
              {
                checked: false,
                hint: { text: 'Flow threshold' },
                text: '100 m3/s',
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
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStations.one.thresholdGroup,
              text: '1000 m',
              hint: { text: 'Level threshold' }
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
            const result = AlertThresholdsPresenter.go(session)

            expect(result.thresholdOptions).to.equal([
              // reduce
              {
                checked: false,
                hint: { text: 'Level threshold' },
                text: '1000 m',
                value: licenceMonitoringStations.one.thresholdGroup
              },
              // stop_or_reduce
              {
                checked: false,
                hint: { text: 'Level threshold' },
                text: '100 m',
                value: licenceMonitoringStations.three.thresholdGroup
              }
            ])
          })
        })
      })

      describe('"and the alert type is not "stop" or "reduce"', () => {
        beforeEach(() => {
          // This could be 'resume' or 'warning'
          delete session.alertType
        })

        it('returns page data for the view, with all the thresholds', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStations.one.thresholdGroup,
              text: '1000 m',
              hint: { text: 'Level threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStations.two.thresholdGroup,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStations.three.thresholdGroup,
              text: '100 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })
      })
    })
  })
})
