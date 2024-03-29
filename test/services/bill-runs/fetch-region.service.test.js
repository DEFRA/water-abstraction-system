'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchRegionService = require('../../../app/services/bill-runs/fetch-region.service.js')

describe('Fetch Region service', () => {
  const naldRegionId = 9
  let testRegion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is a region with a matching NALD region id', () => {
    beforeEach(async () => {
      testRegion = await RegionHelper.add({ naldRegionId })
    })

    it('returns results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result.id).to.equal(testRegion.id)
    })
  })

  describe('when there is no region with a matching NALD region id', () => {
    beforeEach(async () => {
      testRegion = await RegionHelper.add({ naldRegionId: 99 })
    })

    it('returns no results', async () => {
      const result = await FetchRegionService.go(naldRegionId)

      expect(result).to.be.undefined()
    })
  })
})
