'use strict'

/**
 * Used to test the Two-part tariff matching logic
 * @module SupplementaryDataService
 */

const ChargeVersion = require('../../models/water/charge-version.model.js')
const DetermineBillingPeriodsService = require('../billing/determine-billing-periods.service.js')
const FetchRegionService = require('../billing/fetch-region.service.js')

async function go (naldRegionId) {
  const region = await FetchRegionService.go(naldRegionId)
  const billingPeriods = DetermineBillingPeriodsService.go()

  const billingPeriod = billingPeriods[1]

  const licenceRefs = await ChargeVersion.query()
    .select('licenceRef')
    .innerJoinRelated('chargeElements')
    .where('regionCode', naldRegionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('startDate', '<=', billingPeriod.endDate)
    .where('isSection127AgreementEnabled', true)
    .whereNot('status', 'draft')

  return [region.name, billingPeriods[1], licenceRefs]
}

module.exports = {
  go
}
