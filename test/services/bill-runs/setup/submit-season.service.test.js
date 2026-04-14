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
const SubmitSeasonService = require('../../../../app/services/bill-runs/setup/submit-season.service.js')

describe('Bill Runs - Setup - Submit Season service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          season: 'summer'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSeasonService.go(session.id, payload)

        expect(session.season).to.equal('summer')
        expect(session.$update.called).to.be.true()
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitSeasonService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitSeasonService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/year`,
            error: {
              text: 'Select the season'
            },
            pageTitle: 'Select the season',
            sessionId: session.id,
            selectedSeason: null
          })
        })
      })
    })
  })
})
