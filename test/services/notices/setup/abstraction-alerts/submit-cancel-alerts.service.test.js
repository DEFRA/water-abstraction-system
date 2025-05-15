'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const SubmitCancelAlertsService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')

describe('Cancel Alerts Service', () => {
  const monitoringStationId = generateUUID()

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        monitoringStationId
      }
    })
  })

  describe('when called', () => {
    it('returns the monitoring station id', async () => {
      const result = await SubmitCancelAlertsService.go(session.id)

      expect(result).to.equal({ monitoringStationId })
    })

    it('clears the session', async () => {
      await SubmitCancelAlertsService.go(session.id)

      const noSession = await SessionModel.query().where('id', session.id)

      expect(noSession).to.equal([])
    })
  })
})
