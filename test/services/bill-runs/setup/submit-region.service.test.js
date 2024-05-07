'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')

// Thing under test
const SubmitRegionService = require('../../../../app/services/bill-runs/setup/submit-region.service.js')

describe('Bill Runs Setup Submit Region service', () => {
  const regions = [
    { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
    { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' },
    { id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }
  ]

  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({ data: {} })

    Sinon.stub(FetchRegionsService, 'go').resolves(regions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          region: '19a027c6-4aad-47d3-80e3-3917a4579a5b'
        }
      })

      describe('and the bill run type was not two-part tariff', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { type: 'annual' } })
        })

        it('saves the submitted value and returns an object confirming setup is complete', async () => {
          const result = await SubmitRegionService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.region).to.equal('19a027c6-4aad-47d3-80e3-3917a4579a5b')
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

          expect(refreshedSession.region).to.equal('19a027c6-4aad-47d3-80e3-3917a4579a5b')
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
            sessionId: session.id,
            regions,
            selectedRegion: null,
            error: {
              text: 'Select the region'
            }
          })
        })
      })
    })
  })
})
