'use strict'

/**
 * Determines the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryService
 */

const BillingPeriodService = require('./billing-period.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const FetchRegionService = require('./fetch-region.service.js')
const SupplementaryPresenter = require('../../presenters/supplementary.presenter.js')

class SupplementaryService {
  static async go (naldRegionId) {
    const region = await FetchRegionService.go(naldRegionId)
    const billingPeriods = BillingPeriodService.go()
    const licences = await FetchLicencesService.go(region)
    const chargeVersions = await FetchChargeVersionsService.go(region.regionId)

    return this._response({ billingPeriods, licences, chargeVersions })
  }

  static _response (data) {
    const presenter = new SupplementaryPresenter(data)

    return presenter.go()
  }
}

module.exports = SupplementaryService
