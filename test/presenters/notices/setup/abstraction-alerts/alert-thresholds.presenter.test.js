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
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let session

  beforeEach(() => {
    session = {
      ...AbstractionAlertSessionData.monitoringStation(),
      alertType: 'stop'
    }

    licenceMonitoringStationOne = session.licenceMonitoringStations[0].thresholdGroup
    licenceMonitoringStationTwo = session.licenceMonitoringStations[1].thresholdGroup
    licenceMonitoringStationThree = session.licenceMonitoringStations[2].thresholdGroup
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
            value: licenceMonitoringStationTwo
          },
          {
            checked: false,
            hint: {
              text: 'Level threshold'
            },
            text: '100 m',
            value: licenceMonitoringStationThree
          }
        ]
      })
    })

    describe('the "thresholdOptions" property', () => {
      describe('when there are already selected thresholds', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertThresholds: [licenceMonitoringStationTwo],
            alertType: 'stop'
          }
        })

        it('returns page data for the view, with the thresholds checked', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: true,
              value: licenceMonitoringStationTwo,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStationThree,
              text: '100 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })
      })

      describe('and the "alertType" is "stop" ', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertType: 'stop'
          }
        })

        it('returns page data for the view, with only the thresholds with stop restrictions', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStationTwo,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStationThree,
              text: '100 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })

        describe('and a licence monitoring station is "stop_or_reduce" ', () => {
          beforeEach(() => {
            session.licenceMonitoringStations[1].responseType = 'stop_or_reduce'
            session.licenceMonitoringStations[2].responseType = 'stop'
          })

          it('returns page data for the view, with only the thresholds with reduce restrictions', () => {
            const result = AlertThresholdsPresenter.go(session)

            expect(result.thresholdOptions).to.equal([
              {
                checked: false,
                value: licenceMonitoringStationTwo,
                text: '100 m3/s',
                hint: { text: 'Flow threshold' }
              },
              {
                checked: false,
                value: licenceMonitoringStationThree,
                text: '100 m',
                hint: { text: 'Level threshold' }
              }
            ])
          })
        })
      })

      describe('and the "alertType" is "reduce" ', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertType: 'reduce'
          }
        })

        it('returns page data for the view, with only the thresholds with reduce restrictions', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStationOne,
              text: '1000 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })
      })

      describe('"and the alert type is not "stop" or "reduce"', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation()
          }
        })

        it('returns page data for the view, with all the thresholds', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              value: licenceMonitoringStationOne,
              text: '1000 m',
              hint: { text: 'Level threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStationTwo,
              text: '100 m3/s',
              hint: { text: 'Flow threshold' }
            },
            {
              checked: false,
              value: licenceMonitoringStationThree,
              text: '100 m',
              hint: { text: 'Level threshold' }
            }
          ])
        })
      })
    })
  })
})
