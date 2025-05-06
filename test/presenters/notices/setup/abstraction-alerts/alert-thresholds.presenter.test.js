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
  let session

  beforeEach(() => {
    session = {
      ...AbstractionAlertSessionData.monitoringStation(),
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
              text: 'Flow thresholds for this station (m3/s)'
            },
            text: '100 m3/s',
            value: '1'
          },
          {
            checked: false,
            hint: {
              text: 'Level thresholds for this station (m)'
            },
            text: '100 m',
            value: '2'
          }
        ]
      })
    })

    describe('the "thresholdOptions" property', () => {
      describe('when there are already selected thresholds', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertThresholds: ['1'],
            alertType: 'stop'
          }
        })

        it('returns page data for the view, with the thresholds checked', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: true,
              hint: {
                text: 'Flow thresholds for this station (m3/s)'
              },
              text: '100 m3/s',
              value: '1'
            },
            {
              checked: false,
              hint: {
                text: 'Level thresholds for this station (m)'
              },
              text: '100 m',
              value: '2'
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
              hint: {
                text: 'Flow thresholds for this station (m3/s)'
              },
              text: '100 m3/s',
              value: '1'
            },
            {
              checked: false,
              hint: {
                text: 'Level thresholds for this station (m)'
              },
              text: '100 m',
              value: '2'
            }
          ])
        })
      })

      describe('and the "alertType" is "reduce" ', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertType: 'reduce'
          }
        })

        it('returns page data for the view, with only the thresholds with stop restrictions', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              hint: {
                text: 'Flow thresholds for this station (m)'
              },
              text: '1000 m',
              value: '0'
            }
          ])
        })
      })

      describe('and the "alertType" is "warning" ', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertType: 'warning'
          }
        })

        it('returns page data for the view, with all the thresholds', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              hint: {
                text: 'Flow thresholds for this station (m)'
              },
              text: '1000 m',
              value: '0'
            },
            {
              checked: false,
              hint: {
                text: 'Flow thresholds for this station (m3/s)'
              },
              text: '100 m3/s',
              value: '1'
            },
            {
              checked: false,
              hint: {
                text: 'Level thresholds for this station (m)'
              },
              text: '100 m',
              value: '2'
            }
          ])
        })
      })

      describe('and the "alertType" is "resume" ', () => {
        beforeEach(() => {
          session = {
            ...AbstractionAlertSessionData.monitoringStation(),
            alertType: 'resume'
          }
        })

        it('returns page data for the view, with all the thresholds', () => {
          const result = AlertThresholdsPresenter.go(session)

          expect(result.thresholdOptions).to.equal([
            {
              checked: false,
              hint: {
                text: 'Flow thresholds for this station (m)'
              },
              text: '1000 m',
              value: '0'
            },
            {
              checked: false,
              hint: {
                text: 'Flow thresholds for this station (m3/s)'
              },
              text: '100 m3/s',
              value: '1'
            },
            {
              checked: false,
              hint: {
                text: 'Level thresholds for this station (m)'
              },
              text: '100 m',
              value: '2'
            }
          ])
        })
      })
    })
  })
})
