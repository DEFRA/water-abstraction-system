'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CancelService = require('../../../../app/services/return-logs/setup/cancel.service.js')

describe('Return Logs Setup - Cancel service', () => {
  let sessionId

  beforeEach(async () => {
    const session = await SessionHelper.add({
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
    sessionId = session.id
  })

  describe('when called', () => {
    it('fetches the current setup session record and returns page data for the view', async () => {
      const result = await CancelService.go(sessionId)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        activeNavBar: 'search',
        backLink: `/system/return-logs/setup/${sessionId}/check`,
        pageTitle: 'You are about to cancel this return submission',
        purposes: 'Evaporative Cooling',
        returnLogId: 'v1:6:09/999:1003992:2022-04-01:2023-03-31',
        returnPeriod: '1 April 2004 to 31 March 2005',
        returnReceivedDate: '31 January 2025',
        caption: 'Return reference 1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        tariff: 'Standard'
      })
    })
  })
})
