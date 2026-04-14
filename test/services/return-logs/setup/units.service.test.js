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
const UnitsService = require('../../../../app/services/return-logs/setup/units.service.js')

describe('Return Logs Setup - Units service', () => {
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
      const result = await UnitsService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await UnitsService.go(session.id)

      expect(result).to.equal(
        {
          backLink: { href: `/system/return-logs/setup/${session.id}/reported`, text: 'Back' },
          pageTitle: 'Which units were used?',
          pageTitleCaption: 'Return reference 012345',
          units: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
