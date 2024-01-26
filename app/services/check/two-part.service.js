'use strict'

/**
 * Our test iteration of a two-part tariff returns matching engine
 * @module TwoPartService
 */

const DetermineBillingPeriodsService = require('../bill-runs/determine-billing-periods.service.js')
const DetermineIssuesService = require('./determine-issues.service.js')
const FetchLicencesService = require('../bill-runs/two-part-tariff/fetch-licences.service.js')
const LicenceModel = require('../../models/licence.model.js')
const MatchReturnsToChargeElementService = require('../bill-runs/two-part-tariff/match-returns-to-charge-element.service.js')
const PrepareChargeVersionService = require('../bill-runs/two-part-tariff/prepare-charge-version.service.js')
const PrepareReturnLogsService = require('../bill-runs/two-part-tariff/prepare-return-logs.service.js')
const RegionModel = require('../../models/region.model.js')
const ScenarioFormatterService = require('./scenario-formatter.service.js')
const { AllocateReturnsToChargeElementService } = require('./stand-ins.service.js')

async function go (identifier, type) {
  const billingPeriod = _billingPeriod()

  // NOTE: This is something specific to this verify service. The real version will be kicked off as part of creating
  // a new bill run, which means the region ID will be provided as it is required to know who we are creating the bill
  // run for.
  const regionId = await _determineRegionId(identifier, type)

  let licences = await FetchLicencesService.go(regionId, billingPeriod)

  // NOTE: fetchLicencesService depends on FetchChargeVersionsService which was built to support the proper 2PT match &
  // allocate engine so doesn't have the ability to search for just a single licence. We still want to support just
  // verifying a single licence in our check endpoint though. So, if the type is 'licence' we filter out everything that
  // isn't the requested licence.
  if (type === 'licence') {
    licences = licences.filter((licence) => {
      return licence.id === identifier
    })
  }

  await _process(licences, billingPeriod)

  const formattedResults = []
  licences.forEach((licence, licenceIndex) => {
    DetermineIssuesService.go(licence)

    const formattedResult = ScenarioFormatterService.go(licence, licenceIndex)
    formattedResults.push(formattedResult)
  })

  return formattedResults
}

function _billingPeriod () {
  const billingPeriods = DetermineBillingPeriodsService.go()

  return billingPeriods[1]
}

async function _determineRegionId (identifier, type) {
  if (type === 'region') {
    const region = await RegionModel.query()
      .select('id')
      .where('naldRegionId', identifier)
      .limit(1)
      .first()

    return region.id
  }

  const licence = await LicenceModel.query()
    .findById(identifier)
    .select('regionId')

  return licence.regionId
}

/**
 * This is a copy of the main processing loop from app/services/bill-runs/two-part-tariff/match-and-allocate.service.js
 * excluding the persistence.
 */
async function _process (licences, billingPeriod) {
  for (const licence of licences) {
    await PrepareReturnLogsService.go(licence, billingPeriod)

    const { chargeVersions, returnLogs } = licence
    chargeVersions.forEach((chargeVersion) => {
      PrepareChargeVersionService.go(chargeVersion, billingPeriod)

      const { chargeReferences } = chargeVersion
      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const matchingReturns = MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

          if (matchingReturns.length > 0) {
            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargeVersion.chargePeriod, chargeReference)
          }
        })
      })
    })
  }
}

module.exports = {
  go
}
