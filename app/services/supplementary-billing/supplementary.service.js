'use strict'

/**
 * Determines the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryService
 */

const BillingPeriodService = require('./billing-period.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchRegionService = require('./fetch-region.service.js')
const SupplementaryPresenter = require('../../presenters/supplementary.presenter.js')

class SupplementaryService {
  static async go (naldRegionId) {
    const region = await FetchRegionService.go(naldRegionId)
    const chargeVersions = await FetchChargeVersionsService.go(region.regionId)
    const billingPeriods = BillingPeriodService.go()

    return this._response(chargeVersions, billingPeriods)
  }

  static _response (chargeVersions, billingPeriods) {
    const presenter = new SupplementaryPresenter({ chargeVersions, billingPeriods })

    return presenter.go()
  }
}

module.exports = SupplementaryService
