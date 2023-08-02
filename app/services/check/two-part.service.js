'use strict'

/**
 * Used to test the Two-part tariff matching logic
 * @module TwoPartService
 */

const DetermineBillingPeriodsService = require('../billing/determine-billing-periods.service.js')
const LicenceModel = require('../../models/water/licence.model.js')
const ReturnModel = require('../../models/returns/return.model.js')

async function go (naldRegionId) {
  const billingPeriods = DetermineBillingPeriodsService.go()

  const billingPeriod = billingPeriods[1]

  const licences = await LicenceModel.query()
    .select('licences.licenceRef', 'licences.licenceId')
    .innerJoinRelated('chargeVersions.chargeElements')
    .where('chargeVersions.regionCode', naldRegionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions:chargeElements.isSection127AgreementEnabled', true)
    .whereNot('chargeVersions.status', 'draft')
    .withGraphFetched('chargeVersions.chargeElements.chargePurposes')

  for (const licence of licences) {
    licence.returns = await ReturnModel.query()
      .select('returnId', 'returnRequirement', 'startDate', 'endDate')
      .where('licenceRef', licence.licenceRef)
      // used in the service to filter out old returns here `src/lib/services/returns/api-connector.js`
      .where('startDate', '>=', '2008-04-01')
      .where('startDate', '<=', billingPeriod.endDate)
      .where('endDate', '>=', billingPeriod.startDate)
  }

  return licences
}

module.exports = {
  go
}
