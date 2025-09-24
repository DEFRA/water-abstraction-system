'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const PeriodUsedService = require('../../../../app/services/return-logs/setup/period-used.service.js')

describe('Return Logs Setup - Period used service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        returnReference: '012345',
        periodStartDay: '01',
        periodStartMonth: '04',
        periodEndDay: '31',
        periodEndMonth: '03'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await PeriodUsedService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await PeriodUsedService.go(session.id)

      expect(result).to.equal(
        {
          abstractionPeriod: '1 April to 31 March',
          activeNavBar: 'search',
          backLink: `/system/return-logs/setup/${session.id}/single-volume`,
          pageTitle: 'What period was used for this volume?',
          returnReference: '012345',
          periodDateUsedOptions: null,
          periodUsedFromDay: null,
          periodUsedFromMonth: null,
          periodUsedFromYear: null,
          periodUsedToDay: null,
          periodUsedToMonth: null,
          periodUsedToYear: null,
          showDefaultAbstractionPeriod: true
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
