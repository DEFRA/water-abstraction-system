'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCancelService = require('../../../../app/services/return-logs/setup/submit-cancel.service.js')

describe('Return Logs Setup - Submit Cancel service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        endDate: '2005-03-31T00:00:00.000Z',
        periodEndDay: 31,
        periodEndMonth: 12,
        periodStartDay: 1,
        periodStartMonth: 1,
        purposes: 'Evaporative Cooling',
        receivedDate: '2025-01-31T00:00:00.000Z',
        returnLogId: 'v1:6:09/999:1003992:2022-04-01:2023-03-31',
        returnReference: '1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        startDate: '2004-04-01T00:00:00.000Z',
        twoPartTariff: false
      }
    })
  })

  describe('when a user submits the return submission to be cancelled', () => {
    it('deletes the session data', async () => {
      await SubmitCancelService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession).not.to.exist()
    })
  })
})
