'use strict'

/**
 * @module SupplementaryService
 */

const FetchChargeVersionsService = require('./fetch_charge_versions.service.js')
const BillingPeriodService = require('./billing_period.service')

class SupplementaryService {
  static async go (regionId) {
    const chargeVersions = await FetchChargeVersionsService.go(regionId)
    const financialYears = BillingPeriodService.go()
    const response = { chargeVersions, financialYears }

    return response
  }
}

module.exports = SupplementaryService
