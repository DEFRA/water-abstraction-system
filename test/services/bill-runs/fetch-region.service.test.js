'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchRegionService = require('../../../app/services/bill-runs/fetch-region.service.js')

describe('Fetch Region service', () => {
  const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  describe('when there is a region with a matching NALD region id', () => {
    it('returns results', async () => {
      const result = await FetchRegionService.go(region.naldRegionId)

      expect(result.id).to.equal(region.id)
    })
  })

  describe('when there is no region with a matching NALD region id', () => {
    it('returns no results', async () => {
      const result = await FetchRegionService.go(21)

      expect(result).to.be.undefined()
    })
  })
})
