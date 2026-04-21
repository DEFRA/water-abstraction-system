'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitRegionService = require('../../../../app/services/bill-runs/setup/submit-region.service.js')

describe('Bill Runs - Setup - Submit Region service', () => {
  let fetchSessionStub
  let payload
  let region
  let regions
  let session
  let sessionData

  beforeEach(() => {
    regions = RegionHelper.data
    region = RegionHelper.select()

    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(FetchRegionsService, 'go').resolves(regions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          region: region.id
        }
      })

      describe('and the bill run type was not two-part tariff', () => {
        beforeEach(() => {
          sessionData = { type: 'annual' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          expect(session.region).to.equal(region.id)
          expect(session.regionName).to.equal(region.displayName)
          expect(result.setupComplete).to.be.true()
        })
      })

      describe('and the bill run type was two-part tariff', () => {
        beforeEach(() => {
          sessionData = { type: 'two_part_tariff' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          expect(session.region).to.equal(region.id)
          expect(session.regionName).to.equal(region.displayName)
          expect(result.setupComplete).to.be.false()
        })
      })

      describe('and the bill run type was two-part tariff supplementary', () => {
        beforeEach(() => {
          sessionData = { type: 'two_part_supplementary' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('saves the submitted region ID and its name and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          expect(session.region).to.equal(region.id)
          expect(session.regionName).to.equal(region.displayName)
          expect(result.setupComplete).to.be.false()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}

          sessionData = { type: 'annual' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/type`,
            error: {
              text: 'Select the region'
            },
            pageTitle: 'Select the region',
            regions,
            sessionId: session.id,
            selectedRegion: null
          })
        })
      })
    })
  })
})
