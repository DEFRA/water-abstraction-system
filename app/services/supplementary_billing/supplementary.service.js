'use strict'

/**
 * Determines the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryService
 */

const BillingPeriodService = require('./billing_period.service')
const FetchChargeVersionsService = require('./fetch_charge_versions.service.js')
const SupplementaryPresenter = require('../../presenters/supplementary.presenter.js')

class SupplementaryService {
  static async go (regionId) {
    const chargeVersions = await FetchChargeVersionsService.go(regionId)
    const billingPeriods = BillingPeriodService.go()

    return this._response(chargeVersions, billingPeriods)
  }

  static _response (chargeVersions, billingPeriods) {
    const presenter = new SupplementaryPresenter({ chargeVersions, billingPeriods })

    return presenter.go()
  }
}

module.exports = SupplementaryService
