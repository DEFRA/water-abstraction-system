'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmissionService = require('../../../../app/services/return-logs/setup/submission.service.js')

describe('Return Logs Setup - Submission service', () => {
  let sessionId

  before(async () => {
    const session = await SessionHelper.add({ data: { beenReceived: false, returnReference: '1234' } })
    sessionId = session.id
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SubmissionService.go(sessionId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: `/system/return-logs/setup/${sessionId}/received`,
        beenReceived: false,
        journey: null,
        pageTitle: 'What do you want to do with this return?',
        caption: 'Return reference 1234'
      })
    })
  })
})
