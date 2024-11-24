'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helper
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')

describe('Bill Runs Setup - Fetch Regions service', () => {
  describe('when called', () => {
    it('returns the ID and display name for each region ordered by display name', async () => {
      const results = await FetchRegionsService.go()

      // TODO: This is necessary because other region helpers are adding regions into the database as part
      //  of their tests. (Remove when cleans have been removed)
      const expectedRegions = RegionHelper.data.map((region) => {
        return {
          id: region.id,
          displayName: region.displayName
        }
      })

      // This should be removed and do an exact check when the others tests have been migrated to use the seeded regions
      expectedRegions.forEach((expectedRegion) => {
        const region = results.find((region) => {
          return region.id === expectedRegion.id
        })

        expect(region).to.equal(expectedRegion)
      })
    })
  })
})
