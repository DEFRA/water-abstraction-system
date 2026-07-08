// Test helper
import * as RegionHelper from '../../../support/helpers/region.helper.js'

// Thing under test
import FetchRegionsService from '../../../../app/services/bill-runs/setup/fetch-regions.service.js'

describe('Bill Runs Setup - Setup - Fetch Regions service', () => {
  describe('when called', () => {
    it('returns the ID and display name for each region ordered by display name', async () => {
      const results = await FetchRegionsService()

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

        expect(region).toEqual(expectedRegion)
      })
    })
  })
})
