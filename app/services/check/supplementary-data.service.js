'use strict'

/**
 * Confirms the billing periods, licences and charge versions used to generate an SROC supplementary bill run
 * @module SupplementaryDataService
 */

const BillingPeriodService = require('../supplementary-billing/billing-period.service.js')
const FetchChargeVersionsService = require('../supplementary-billing/fetch-charge-versions.service.js')
const FetchLicencesService = require('../supplementary-billing/fetch-licences.service.js')
const FetchRegionService = require('../supplementary-billing/fetch-region.service.js')
const SupplementaryPresenter = require('../../presenters/supplementary.presenter.js')

async function go (naldRegionId) {
  const region = await FetchRegionService.go(naldRegionId)
  const billingPeriods = BillingPeriodService.go()
  const licences = await FetchLicencesService.go(region)

  // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
  // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
  // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
  // This is why we are only passing through the first billing period; we know there is only one!
  const chargeVersions = await FetchChargeVersionsService.go(region.regionId, billingPeriods[0])

  return _response({ billingPeriods, licences, chargeVersions })
}

function _response (data) {
  return SupplementaryPresenter.go(data)
}

module.exports = {
  go
}
