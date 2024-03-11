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
const RegionService = require('../../../../app/services/bill-runs/setup/region.service.js')

describe('Bill Runs Setup Region service', () => {
  const regions = [
    { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
    { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' },
    { id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }
  ]

  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({ data: { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b' } })

    Sinon.stub(FetchRegionsService, 'go').resolves(regions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RegionService.go(session.id)

      expect(result).to.equal({
        sessionId: session.id,
        regions,
        selectedRegion: '19a027c6-4aad-47d3-80e3-3917a4579a5b'
      })
    })
  })
})
