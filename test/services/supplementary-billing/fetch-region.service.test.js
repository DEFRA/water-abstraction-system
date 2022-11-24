'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchRegionService = require('../../../app/services/supplementary-billing/fetch-region.service.js')

describe('Fetch Regio Service', () => {
  const naldRegionId = 9
  let testRecords

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is a region with a matching NALD region id', () => {
    beforeEach(async () => {
      testRecords = await RegionHelper.add()
    })

    it('returns results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result.regionId).to.equal(testRecords[0].regionId)
    })
  })

  describe('when there is no region with a matching NALD region id', () => {
    beforeEach(async () => {
      RegionHelper.add({ nald_region_id: 99 })
    })

    it('returns no results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result).to.be.undefined()
    })
  })
})
