'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const TypeService = require('../../../../app/services/bill-runs/setup/type.service.js')

describe('Bill Runs Setup Type service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { type: 'annual' } })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await TypeService.go(session.id)

      expect(result).to.equal({
        sessionId: session.id,
        selectedType: 'annual'
      })
    })
  })
})
