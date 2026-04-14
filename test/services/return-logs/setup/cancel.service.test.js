'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const CancelService = require('../../../../app/services/return-logs/setup/cancel.service.js')

describe('Return Logs Setup - Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      endDate: '2005-03-31T00:00:00.000Z',
      periodEndDay: 31,
      periodEndMonth: 12,
      periodStartDay: 1,
      periodStartMonth: 1,
      purposes: 'Evaporative Cooling',
      receivedDate: '2025-01-31T00:00:00.000Z',
      returnLogId: '1130dfa0-e8ed-43cb-91db-5f9d79bbef5f',
      returnReference: '1234',
      siteDescription: 'POINT A, TEST SITE DESCRIPTION',
      startDate: '2004-04-01T00:00:00.000Z',
      twoPartTariff: false
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record and returns page data for the view', async () => {
      const result = await CancelService.go(session.id)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        backLink: { href: `/system/return-logs/setup/${session.id}/check`, text: 'Back' },
        pageTitle: 'You are about to cancel this return submission',
        purposes: 'Evaporative Cooling',
        returnLogId: '1130dfa0-e8ed-43cb-91db-5f9d79bbef5f',
        returnPeriod: '1 April 2004 to 31 March 2005',
        returnReceivedDate: '31 January 2025',
        pageTitleCaption: 'Return reference 1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        tariff: 'Standard'
      })
    })
  })
})
