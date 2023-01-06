'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const FetchRegionService = require('../../../app/services/supplementary-billing/fetch-region.service.js')

describe('Fetch Region service', () => {
  const naldRegionId = 9
  let testRegion

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is a region with a matching NALD region id', () => {
    beforeEach(async () => {
      testRegion = await RegionHelper.add()
    })

    it('returns results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result.regionId).to.equal(testRegion.regionId)
    })
  })

  describe('when there is no region with a matching NALD region id', () => {
    beforeEach(async () => {
      RegionHelper.add({ naldRegionId: 99 })
    })

    it('returns no results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result).to.be.undefined()
    })
  })
})
