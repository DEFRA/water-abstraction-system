'use strict'

/**
 * @module SupplementaryService
 */

const FetchChargeVersionsService = require('./fetch_charge_versions.service.js')

class SupplementaryService {
  static async go (regionId) {
    const chargeVersions = await FetchChargeVersionsService.go(regionId)
    const response = { chargeVersions }

    return response
  }
}

module.exports = SupplementaryService
