'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const AlertThresholdsService = require('../../../../../app/services/notices/setup/abstraction-alerts/alert-thresholds.service.js')

describe('Alert Thresholds Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}
    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AlertThresholdsService.go(session.id)

      expect(result).to.equal({})
    })
  })
})
