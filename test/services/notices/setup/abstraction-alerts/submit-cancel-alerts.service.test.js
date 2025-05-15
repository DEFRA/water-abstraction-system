'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../../app/models/session.model.js')

// Thing under test
const SubmitCancelAlertsService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')

describe('Cancel Alerts Service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelAlertsService.go(session.id)

      const noSession = await SessionModel.query().where('id', session.id)

      expect(noSession).to.equal([])
    })
  })
})
