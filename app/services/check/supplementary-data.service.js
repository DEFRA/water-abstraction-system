'use strict'

/**
 * Confirms the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryDataService
 */

const BillingPeriodService = require('../supplementary-billing/billing-period.service.js')
const FetchChargeVersionsService = require('../supplementary-billing/fetch-charge-versions.service.js')
const FetchRegionService = require('../supplementary-billing/fetch-region.service.js')
const SupplementaryDataPresenter = require('../../presenters/check/supplementary-data.presenter.js')

async function go (naldRegionId) {
  const region = await FetchRegionService.go(naldRegionId)
  const billingPeriods = BillingPeriodService.go()

  // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
  // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
  // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
  // This is why we are only passing through the first billing period; we know there is only one!
  const chargeVersions = await FetchChargeVersionsService.go(region.regionId, billingPeriods[0])

  return _response({ billingPeriods, chargeVersions })
}

function _response (data) {
  return SupplementaryDataPresenter.go(data)
}

module.exports = {
  go
}
