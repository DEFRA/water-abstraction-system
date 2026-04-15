'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SeasonService = require('../../../../app/services/bill-runs/setup/season.service.js')

describe('Bill Runs - Setup - Type service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { season: 'summer' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SeasonService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/year`,
        pageTitle: 'Select the season',
        sessionId: session.id,
        selectedSeason: 'summer'
      })
    })
  })
})
