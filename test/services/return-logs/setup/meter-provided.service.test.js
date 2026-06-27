'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const MeterProvidedService = require('../../../../app/services/return-logs/setup/meter-provided.service.js')

describe('Return Logs Setup - Meter Provided service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await MeterProvidedService.go(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await MeterProvidedService.go(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/units`, text: 'Back' },
        meterProvided: null,
        pageTitle: 'Have meter details been provided?',
        pageTitleCaption: 'Return reference 012345'
      })
    })
  })
})
