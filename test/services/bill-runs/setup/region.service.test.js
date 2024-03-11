'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const RegionService = require('../../../../app/services/bill-runs/setup/region.service.js')

describe('Bill Runs Setup Region service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    await Promise.all([
      RegionHelper.add({ id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' }),
      RegionHelper.add({ id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }),
      RegionHelper.add({ id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' })
    ])

    session = await SessionHelper.add({ data: { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b' } })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RegionService.go(session.id)

      expect(result).to.equal({
        sessionId: session.id,
        regions: [
          { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
          { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' },
          { id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }
        ],
        selectedRegion: '19a027c6-4aad-47d3-80e3-3917a4579a5b'
      })
    })
  })
})
