'use strict'

/**
 * @module SupplementaryService
 */

const BillingPeriodService = require('./billing_period.service')
const FetchChargeVersionsService = require('./fetch_charge_versions.service.js')
const SupplementaryPresenter = require('../../presenters/supplementary.presenter.js')

class SupplementaryService {
  static async go (regionId) {
    const chargeVersions = await FetchChargeVersionsService.go(regionId)
    const financialYears = BillingPeriodService.go()

    return this._response(chargeVersions, financialYears)
  }

  static _response (chargeVersions, financialYears) {
    const presenter = new SupplementaryPresenter({ chargeVersions, financialYears })

    return presenter.go()
  }
}

module.exports = SupplementaryService
