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

/**
 * WIP: This is currently being used to generate testing data to confirm we are understanding SROC supplementary
 * billing. We intend to refactor things so that the service starts representing what is actually required.
 */
class SupplementaryService {
  static async go (naldRegionId) {
    const region = await FetchRegionService.go(naldRegionId)
    const billingPeriods = BillingPeriodService.go()
    const licences = await FetchLicencesService.go(region)

    // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
    // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
    // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
    // This is why we are only passing through the first billing period; we know there is only one!
    const chargeVersions = await FetchChargeVersionsService.go(region.regionId, billingPeriods[0])

    return this._response({ billingPeriods, licences, chargeVersions })
  }

  static _response (data) {
    return SupplementaryPresenter.go(data)
  }
}

module.exports = SupplementaryService
