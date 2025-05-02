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

  beforeEach(async () => {
    payload = { 'alert-type': 'stop' }
    sessionData = AbstractionAlertSessionData.monitoringStation()

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
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

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
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
})
