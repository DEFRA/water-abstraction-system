// Test helpers
import RegionHelper from '../../support/helpers/region.helper.js'

// Thing under test
import FetchRegionService from '../../../app/services/bill-runs/fetch-region.service.js'

describe('Fetch Region service', () => {
  const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  describe('when there is a region with a matching NALD region id', () => {
    it('returns results', async () => {
      const result = await FetchRegionService(region.naldRegionId)

      expect(result.id).toEqual(region.id)
    })
  })

  describe('when there is no region with a matching NALD region id', () => {
    it('returns no results', async () => {
      const result = await FetchRegionService(21)

      expect(result).toBeUndefined()
    })
  })
})
