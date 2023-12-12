'use strict'

/**
 * Our test iteration of a two-part tariff returns matching engine
 * @module TwoPartService
 */

const { ref } = require('objection')

const AllocateReturnsService = require('./allocate-returns.service.js')
const DetermineBillingPeriodsService = require('../bill-runs/determine-billing-periods.service.js')
const FetchChargeVersionsService = require('../bill-runs/two-part-tariff/fetch-charge-versions.service.js')
const LicenceModel = require('../../models/licence.model.js')
const RegionModel = require('../../models/region.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const ScenarioFormatterService = require('./scenario-formatter.service.js')

async function go (identifier, type) {
  const billingPeriod = _billingPeriod()

  const chargeVersions = await _fetchChargeVersions(billingPeriod, identifier, type)
  const chargeVersionsGroupedByLicence = await _groupByLicenceAndMatchReturns(chargeVersions, billingPeriod)

  const result = AllocateReturnsService.go(chargeVersionsGroupedByLicence, billingPeriod)

  return ScenarioFormatterService.go(result)
}

function _billingPeriod () {
  const billingPeriods = DetermineBillingPeriodsService.go()

  return billingPeriods[1]
}

async function _fetchChargeVersions (billingPeriod, identifier, type) {
  let regionId = ''
  if (type === 'region') {
    const region = await RegionModel.query().select('identifier').where('naldRegionId', identifier)
    regionId = region.id
  } else {
    const licence = await LicenceModel.query()
      .findById(identifier)
      .select('regionId')
    regionId = licence.regionId
  }
  return await FetchChargeVersionsService.go(regionId, billingPeriod)
}

async function _fetchReturnsForLicence (licenceRef, billingPeriod) {
  const returns = await ReturnLogModel.query()
    .select([
      'id',
      'returnRequirement',
      ref('metadata:description').castText().as('description'),
      'startDate',
      'endDate',
      'dueDate',
      'receivedDate',
      'status',
      'underQuery',
      ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('metadata:purposes').as('purposes')
    ])
    .where('licenceRef', licenceRef)
    // water-abstraction-service filters out old returns in this way: see `src/lib/services/returns/api-connector.js`
    .where('startDate', '>=', '2008-04-01')
    .where('startDate', '<=', billingPeriod.endDate)
    .where('endDate', '>=', billingPeriod.startDate)
    .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
    .orderBy('startDate', 'ASC')
    .orderBy('returnRequirement', 'ASC')
    .withGraphFetched('returnSubmissions')
    .modifyGraph('returnSubmissions', builder => {
      builder
        .select([
          'id',
          'nilReturn'
        ])
        .where('returnSubmissions.current', true)
    })
    .withGraphFetched('returnSubmissions.returnSubmissionLines')
    .modifyGraph('returnSubmissions.returnSubmissionLines', builder => {
      builder
        .select([
          'id',
          'startDate',
          'endDate',
          'quantity'
        ])
        .where('returnSubmissionLines.quantity', '>', 0)
        .where('returnSubmissionLines.startDate', '<=', billingPeriod.endDate)
        .where('returnSubmissionLines.endDate', '>=', billingPeriod.startDate)
    })

  return returns
}

async function _groupByLicenceAndMatchReturns (chargeVersions, billingPeriod) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.id
  })

  const uniqueLicenceIds = [...new Set(allLicenceIds)]

  // NOTE: We could have initialized licences as an empty array and pushed each new object. But for a big region
  // the number of licences we might be dealing will be in the hundreds, possibly thousands. In these cases we get a
  // performance bump if we create the array sized to our needs first, rather than asking Node to resize the array on
  // each loop. Only applicable here though! Don't go doing this for every new array you declare ;-)
  const licences = Array(uniqueLicenceIds.length).fill(undefined)

  for (let i = 0; i < uniqueLicenceIds.length; i++) {
    const licenceId = uniqueLicenceIds[i]
    const matchedChargeVersions = chargeVersions.filter((chargeVersion) => {
      return chargeVersion.licence.id === licenceId
    })

    const { licenceRef, startDate, expiredDate, lapsedDate, revokedDate } = matchedChargeVersions[0].licence
    const returns = await _fetchReturnsForLicence(licenceRef, billingPeriod)

    licences[i] = {
      id: licenceId,
      licenceRef,
      startDate,
      expiredDate,
      lapsedDate,
      revokedDate,
      chargeVersions: matchedChargeVersions,
      returns
    }
  }

  return licences
}

module.exports = {
  go
}
