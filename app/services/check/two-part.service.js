'use strict'

/**
 * Our test iteration of a two-part tariff returns matching engine
 * @module TwoPartService
 */

const DetermineBillingPeriodsService = require('../bill-runs/determine-billing-periods.service.js')
const DetermineIssuesService = require('./determine-issues.service.js')
const LicenceModel = require('../../models/licence.model.js')
const RegionModel = require('../../models/region.model.js')
const ScenarioFormatterService = require('./scenario-formatter.service.js')
const { allocateReturnsToLicencesService, fetchLicencesService, prepareLicencesForAllocationService } = require('./stand-in.service.js')

async function go (identifier, type) {
  const billingPeriod = _billingPeriod()

  // NOTE: This is something specific to this verify service. The real version will be kicked off as part of creating
  // a new bill run, which means the region ID will be provided as it is required to know who we are creating the bill
  // run for.
  const regionId = await _determineRegionId(identifier, type)

  let licences = await fetchLicencesService.go(regionId, billingPeriod)

  // NOTE: fetchLicencesService depends on FetchChargeVersionsService which was built to support the proper 2PT match &
  // allocate engine so doesn't have the ability to search for just a single licence. We still want to support just
  // verifying a single licence in our check endpoint though. So, if the type is 'licence' we filter out everything that
  // isn't the requested licence.
  if (type === 'licence') {
    licences = licences.filter((licence) => {
      return licence.id === identifier
    })
  }

  await prepareLicencesForAllocationService.go(licences, billingPeriod)

  allocateReturnsToLicencesService.go(licences)

  licences.forEach((licence, licenceIndex) => {
    DetermineIssuesService.go(licence)
  })

  return licences

  // return ScenarioFormatterService.go(result)
}

function _billingPeriod () {
  const billingPeriods = DetermineBillingPeriodsService.go()

  return billingPeriods[1]
}

async function _determineRegionId (identifier, type) {
  if (type === 'region') {
    const region = await RegionModel.query()
      .select('identifier')
      .where('naldRegionId', identifier)

    return region.id
  }

  const licence = await LicenceModel.query()
    .findById(identifier)
    .select('regionId')

  return licence.regionId
}

module.exports = {
  go
}
