'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RegionSeeder = require('../../../support/seeders/regions.seeder.js')

// Thing under test
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')

describe('Bill Runs Setup Fetch Regions service', () => {
  describe('when called', () => {
    it('returns the ID and display name for each region ordered by display name', async () => {
      const results = await FetchRegionsService.go()

      // This is necessary because other region helpers are adding regions into the database as part of their tests.
      const expectedRegions = [
        { id: RegionSeeder.regions.anglian.id, displayName: RegionSeeder.regions.anglian.display_name },
        { id: RegionSeeder.regions.midlands.id, displayName: RegionSeeder.regions.midlands.display_name },
        { id: RegionSeeder.regions.north_east.id, displayName: RegionSeeder.regions.north_east.display_name },
        { id: RegionSeeder.regions.north_west.id, displayName: RegionSeeder.regions.north_west.display_name },
        { id: RegionSeeder.regions.southern.id, displayName: RegionSeeder.regions.southern.display_name },
        { id: RegionSeeder.regions.south_west.id, displayName: RegionSeeder.regions.south_west.display_name },
        { id: RegionSeeder.regions.test_region.id, displayName: RegionSeeder.regions.test_region.display_name },
        { id: RegionSeeder.regions.thames.id, displayName: RegionSeeder.regions.thames.display_name },
        { id: RegionSeeder.regions.ea_wales.id, displayName: RegionSeeder.regions.ea_wales.display_name }
      ]

      // This should be removed and do an exact check when the others tests have been migrated to use the seeded regions
      expectedRegions.forEach((expectedRegion) => {
        const region = results.find((region) => { return region.id === expectedRegion.id })

        expect(region).to.equal(expectedRegion)
      })
    })
  })
})
