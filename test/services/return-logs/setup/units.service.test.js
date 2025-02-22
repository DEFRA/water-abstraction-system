'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const UnitsService = require('../../../../app/services/return-logs/setup/units.service.js')

describe('Return Logs Setup - Units service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        returnReference: '012345'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await UnitsService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await UnitsService.go(session.id)

      expect(result).to.equal(
        {
          pageTitle: 'Which units were used?',
          activeNavBar: 'search',
          returnReference: '012345',
          backLink: `/system/return-logs/setup/${session.id}/reported`,
          units: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
