'use strict'

/**
 * Our test iteration of a two-part tariff returns matching engine
 * @module TwoPartService
 */

const { ref } = require('objection')

const AllocateReturnsService = require('./allocate-returns.service.js')
const ChargeReferenceModel = require('../../models/water/charge-reference.model.js')
const ChargeVersionModel = require('../../models/water/charge-version.model.js')
const FriendlyResponseService = require('./friendly-response.service.js')
const DetermineBillingPeriodsService = require('../bill-runs/determine-billing-periods.service.js')
const ReturnModel = require('../../models/returns/return.model.js')
const Workflow = require('../../models/water/workflow.model.js')

async function go (id, type) {
  const startTime = process.hrtime.bigint()

  const billingPeriod = _billingPeriod()

  const chargeVersions = await _fetchChargeVersions(billingPeriod, id, type)
  const chargeVersionsGroupedByLicence = await _groupByLicenceAndMatchReturns(chargeVersions, billingPeriod)

  const result = AllocateReturnsService.go(chargeVersionsGroupedByLicence, billingPeriod)

  _calculateAndLogTime(startTime, id, type)

  return result
}

function _billingPeriod () {
  const billingPeriods = DetermineBillingPeriodsService.go()

  return billingPeriods[1]
}

function _calculateAndLogTime (startTime, id, type) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg(`Two part tariff ${type} matching complete`, { id, timeTakenMs })
}

async function _fetchChargeVersions (billingPeriod, id, type) {
  const whereClause = type === 'region' ? 'chargeVersions.regionCode' : 'chargeVersions.licenceId'

  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.chargeVersionId',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.status'
    ])
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .where(whereClause, id)
    .whereNotExists(
      Workflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId')
        .whereNull('chargeVersionWorkflows.dateDeleted')
    )
    .whereExists(
      ChargeReferenceModel.query()
        .select(1)
        .whereColumn('chargeVersions.chargeVersionId', 'chargeReferences.chargeVersionId')
        // NOTE: We can make withJsonSuperset() work which looks nicer, but only if we don't have anything camel case
        // in the table/column name. Camel case mappers don't work with whereJsonSuperset() or whereJsonSubset(). So,
        // rather than have to remember that quirk we stick with whereJsonPath() which works in all cases.
        .whereJsonPath('chargeReferences.adjustments', '$.s127', '=', true)
    )
    .orderBy('chargeVersions.licenceRef')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'licenceId',
        'licenceRef',
        'startDate',
        'expiredDate',
        'lapsedDate',
        'revokedDate'
      ])
    })
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder
        .select([
          'chargeElementId',
          'description',
          ref('chargeElements.adjustments:s127').castText().as('s127')
        ])
        .whereJsonPath('chargeElements.adjustments', '$.s127', '=', true)
    })
    .withGraphFetched('chargeReferences.chargeCategory')
    .modifyGraph('chargeReferences.chargeCategory', (builder) => {
      builder
        .select([
          'reference',
          'shortDescription',
          'subsistenceCharge'
        ])
    })
    .withGraphFetched('chargeReferences.chargeElements')
    .modifyGraph('chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'chargePurposeId',
          'description',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'authorisedAnnualQuantity'
        ])
        .where('isSection127AgreementEnabled', true)
        .orderBy('authorisedAnnualQuantity', 'desc')
    })
    .withGraphFetched('chargeReferences.chargeElements.purpose')
    .modifyGraph('chargeReferences.chargeElements.purpose', (builder) => {
      builder
        .select([
          'purposeUseId',
          'legacyId',
          'description'
        ])
    })

  return chargeVersions
}

async function _fetchReturnsForLicence (licenceRef, billingPeriod) {
  const returns = await ReturnModel.query()
    .select([
      'returnId',
      'returnRequirement',
      ref('metadata:description').castText().as('description'),
      'startDate',
      'endDate',
      'status',
      'underQuery',
      ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
      ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
      ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
      ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth'),
      ref('metadata:purposes[0].tertiary.code').castText().as('purposeCode'),
      ref('metadata:purposes[0].tertiary.description').castText().as('purposeDescription'),
      ref('metadata:purposes[0].alias').castText().as('alias')
    ])
    .where('licenceRef', licenceRef)
    // water-abstraction-service filters out old returns in this way: see `src/lib/services/returns/api-connector.js`
    .where('startDate', '>=', '2008-04-01')
    .where('startDate', '<=', billingPeriod.endDate)
    .where('endDate', '>=', billingPeriod.startDate)
    .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
    .withGraphFetched('versions')
    .modifyGraph('versions', builder => {
      builder
        .select([
          'versionId',
          'nilReturn'
        ])
        .where('versions.current', true)
    })
    .withGraphFetched('versions.lines')
    .modifyGraph('versions.lines', builder => {
      builder
        .select([
          'lineId',
          'startDate',
          'endDate',
          'quantity'
        ])
        .where('lines.quantity', '>', 0)
        .where('lines.startDate', '<=', billingPeriod.endDate)
        .where('lines.endDate', '>=', billingPeriod.startDate)
    })

  return returns
}

async function _groupByLicenceAndMatchReturns (chargeVersions, billingPeriod) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.licenceId
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
      return chargeVersion.licence.licenceId === licenceId
    })

    const { licenceRef, startDate, expiredDate, lapsedDate, revokedDate } = matchedChargeVersions[0].licence
    const returns = await _fetchReturnsForLicence(licenceRef, billingPeriod)

    licences[i] = {
      licenceId,
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
