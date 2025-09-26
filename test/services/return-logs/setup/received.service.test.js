'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReceivedService = require('../../../../app/services/return-logs/setup/received.service.js')

describe('Return Logs - Setup - Received service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        licenceId: '736144f1-203d-46bb-9968-5137ae06a7bd',
        returnLogId: 'v1:1:01/12/123:10065476:2025-01-06:2025-10-31',
        returnReference: '012345'
      },
      id: 'd958333a-4acd-4add-9e2b-09e14c6b72f3'
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ReceivedService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReceivedService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'When was the return received?',
          pageTitleCaption: 'Return reference 012345',
          backLink: {
            href: `/system/return-logs?id=v1:1:01/12/123:10065476:2025-01-06:2025-10-31`,
            text: 'Back'
          },
          receivedDateOption: null,
          receivedDateDay: null,
          receivedDateMonth: null,
          receivedDateYear: null
        },
        { skip: ['sessionId', 'todaysDate', 'yesterdaysDate'] }
      )
    })
  })
})
