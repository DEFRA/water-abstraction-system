'use strict'

/**
 * Used to test the Two-part tariff matching logic
 * @module SupplementaryDataService
 */

const FetchRegionService = require('../billing/fetch-region.service.js')

async function go (naldRegionId) {
  const region = await FetchRegionService.go(naldRegionId)

  return {
    regionName: region.name
  }
}

module.exports = {
  go
}
