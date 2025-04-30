'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const AlertTypeService = require('../../../../../app/services/notices/setup/abstraction-alerts/alert-type.service.js')

describe('Notices Setup - Abstraction Alerts - Alert Type Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = AbstractionAlertSessionData.monitoringStation()
    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AlertTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        alertTypeOptions: [
          {
            hint: {
              text: 'Tell licence holders they may need to reduce or stop water abstraction soon.'
            },
            text: 'Warning',
            value: 'warning'
          },
          {
            hint: {
              text: 'Tell licence holders they can take water at a reduced amount.'
            },
            text: 'Reduce',
            value: 'reduce'
          },
          {
            hint: {
              text: 'Tell licence holders they must stop taking water.'
            },
            text: 'Stop',
            value: 'stop'
          },
          {
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
  })
})
