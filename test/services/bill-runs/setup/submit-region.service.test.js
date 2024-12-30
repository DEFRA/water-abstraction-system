'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')

// Thing under test
const SubmitRegionService = require('../../../../app/services/bill-runs/setup/submit-region.service.js')

describe('Bill Runs - Setup - Submit Region service', () => {
  let payload
  let region
  let regions
  let session

  beforeEach(async () => {
    regions = RegionHelper.data
    region = RegionHelper.select()

    session = await SessionHelper.add({ data: {} })

    Sinon.stub(FetchRegionsService, 'go').resolves(regions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          region: region.id
        }
      })

      describe('and the bill run type was not two-part tariff', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { type: 'annual' } })
        })

        it('saves the submitted value and returns an object confirming setup is complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.region).to.equal(region.id)
          expect(result.setupComplete).to.be.true()
        })
      })

      describe('and the bill run type was two-part tariff', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { type: 'two_part_tariff' } })
        })

        it('saves the submitted value and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.region).to.equal(region.id)
          expect(result.setupComplete).to.be.false()
        })
      })

      describe('and the bill run type was two-part tariff supplementary', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { type: 'two_part_supplementary' } })
        })

        it('saves the submitted value and returns an object confirming setup is not complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.region).to.equal(region.id)
          expect(result.setupComplete).to.be.false()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(async () => {
          payload = {}

          session = await SessionHelper.add({ data: { type: 'annual' } })
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          expect(result).to.equal({
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
