'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const AlertTypePresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/alert-type.presenter.js')

describe('Notices - Setup - Abstraction Alerts - Alert Type Presenter', () => {
  let sessionData

  beforeEach(async () => {
    sessionData = AbstractionAlertSessionData.monitoringStation()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertTypePresenter.go(sessionData)

      expect(result).to.equal({
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
        backLink: `/system/monitoring-stations/${sessionData.monitoringStationId}`,
        caption: 'Death star',
        pageTitle: 'Select the type of alert you need to send'
      })
    })

    describe('and there is a previous selection', () => {
      describe('and the selection was "warning', () => {
        beforeEach(() => {
          sessionData.alertType = 'warning'
        })

        it('returns page data for the view, with the option selected', () => {
          const result = AlertTypePresenter.go(sessionData)

          expect(result.alertTypeOptions[0]).to.equal({
            checked: true,
            hint: {
              text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
            },
            text: 'Warning',
            value: 'warning'
          })
        })
      })

      describe('and the selection was "reduce', () => {
        beforeEach(() => {
          sessionData.alertType = 'reduce'
        })

        it('returns page data for the view, with the option selected', () => {
          const result = AlertTypePresenter.go(sessionData)

          expect(result.alertTypeOptions[1]).to.equal({
            checked: true,
            hint: {
              text: 'Tell licence holders they can take water at a reduced amount.'
            },
            text: 'Reduce',
            value: 'reduce'
          })
        })
      })

      describe('and the selection was "stop', () => {
        beforeEach(() => {
          sessionData.alertType = 'stop'
        })

        it('returns page data for the view, with the option selected', () => {
          const result = AlertTypePresenter.go(sessionData)

          expect(result.alertTypeOptions[2]).to.equal({
            checked: true,
            hint: {
              text: 'Tell licence holders they must stop taking water.'
            },
            text: 'Stop',
            value: 'stop'
          })
        })
      })

      describe('and the selection was "resume', () => {
        beforeEach(() => {
          sessionData.alertType = 'resume'
        })

        it('returns page data for the view, with the option selected', () => {
          const result = AlertTypePresenter.go(sessionData)

          expect(result.alertTypeOptions[3]).to.equal({
            checked: true,
            hint: {
              text: 'Tell licence holders they can take water at the normal amount.'
            },
            text: 'Resume',
            value: 'resume'
          })
        })
      })
    })
  })
})
