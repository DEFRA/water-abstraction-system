'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReportedService = require('../../../../app/services/return-logs/setup/reported.service.js')

describe('Return Logs Setup - Reported service', () => {
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
      const result = await ReportedService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReportedService.go(session.id)

      expect(result).to.equal(
        {
          pageTitle: 'How was this return reported?',
          activeNavBar: 'search',
          returnReference: '012345',
          backLink: `/system/return-logs/setup/${session.id}/start`,
          reported: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
