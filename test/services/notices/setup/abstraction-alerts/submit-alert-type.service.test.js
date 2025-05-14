'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../../test/support/helpers/session.helper.js')

// Thing under test
const SubmitAlertTypeService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-type.service.js')

describe('Notices Setup - Abstraction Alerts - Alert Type Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = { 'alert-type': 'stop' }
    sessionData = AbstractionAlertSessionData.monitoringStation()
  })

  describe('when called', () => {
    describe('when the "alertType" has not been previously set', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertType).to.equal('stop')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('when the user selects a different "alertType" to a previous selection', () => {
      beforeEach(async () => {
        sessionData.alertType = 'resume'

        session = await SessionHelper.add({ data: sessionData })
      })

      it('sets the "alertThresholds" to an empty array', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertThresholds).to.equal([])
      })
    })

    describe('when the user selects the same "alertType" they previously selected', () => {
      beforeEach(async () => {
        sessionData.alertType = 'stop'
        sessionData.alertThresholds = ['100-flow']

        session = await SessionHelper.add({ data: sessionData })
      })

      it('does not change the existing "alertThresholds"', async () => {
        await SubmitAlertTypeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertThresholds).to.equal(['100-flow'])
      })
    })
  })

  describe('when validation fails', () => {
    describe('and no option has been selected', () => {
      beforeEach(async () => {
        payload = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
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
          error: {
            text: 'Select the type of alert you need to send'
          },
          pageTitle: 'Select the type of alert you need to send'
        })
      })
    })

    describe('and "stop" or "reduce" have been selected but no thresholds have that alert type', () => {
      beforeEach(async () => {
        payload = { 'alert-type': 'stop' }

        sessionData.licenceMonitoringStations = [
          {
            ...sessionData.licenceMonitoringStations[0],
            restrictionType: 'warning'
          }
        ]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertTypeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
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
          error: {
            text: 'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
          },
          pageTitle: 'Select the type of alert you need to send'
        })
      })
    })
  })
})
