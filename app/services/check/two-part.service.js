'use strict'

/**
 * Used to test the Two-part tariff matching logic
 * @module TwoPartService
 */

const { ref } = require('objection')

const ChargeElementModel = require('../../models/water/charge-element.model.js')
const ChargeVersionModel = require('../../models/water/charge-version.model.js')
const ChargeVersionWorkflow = require('../../models/water/charge-version-workflow.model.js')
const DetermineBillingPeriodsService = require('../billing/determine-billing-periods.service.js')
const ReturnModel = require('../../models/returns/return.model.js')

async function go (naldRegionId, format = 'friendly') {
  const startTime = process.hrtime.bigint()

  const billingPeriods = DetermineBillingPeriodsService.go()

  const billingPeriod = billingPeriods[1]

  const chargeVersions = await _fetchChargeVersions(billingPeriod, naldRegionId)

  for (const chargeVersion of chargeVersions) {
    await _fetchAndApplyReturns(billingPeriod, chargeVersion)
  }

  const matchedChargeVersions = _matchChargeVersions(chargeVersions)

  _calculateAndLogTime(startTime)

  switch (format) {
    case 'friendly':
      return _friendlyResponse(matchedChargeVersions)
    case 'raw':
      return matchedChargeVersions
    default:
      // TODO: consider throwing a Boom error here
      return { error: `Invalid format ${format}` }
  }
}

async function _fetchChargeVersions (billingPeriod, naldRegionId) {
  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'chargeVersions.chargeVersionId',
      'chargeVersions.startDate',
      'chargeVersions.endDate',
      'chargeVersions.status',
      'chargeVersions.licenceId',
      'chargeVersions.licenceRef'
    ])
    .where('chargeVersions.regionCode', naldRegionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .whereNotExists(
      ChargeVersionWorkflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'chargeVersionWorkflows.licenceId')
        .whereNull('chargeVersionWorkflows.dateDeleted')
    )
    .whereExists(
      ChargeElementModel.query()
        .select(1)
        .whereColumn('chargeVersions.chargeVersionId', 'chargeElements.chargeVersionId')
        // NOTE: We can make withJsonSuperset() work which looks nicer, but only if we don't have anything camel case
        // in the table/column name. Camel case mappers don't work with whereJsonSuperset() or whereJsonSubset(). So,
        // rather than have to remember that quirk we stick with whereJsonPath() which works in all cases.
        .whereJsonPath('chargeElements.adjustments', '$.s127', '=', true)
    )
    .withGraphFetched('chargeElements')
    .modifyGraph('chargeVersions.chargeElements', (builder) => {
      builder.whereJsonPath('chargeElements.adjustments', '$.s127', '=', true)
    })
    .withGraphFetched('chargeElements.billingChargeCategory')
    .modifyGraph('chargeElements.billingChargeCategory', (builder) => {
      builder.select([
        'reference',
        'shortDescription'
      ])
    })
    .withGraphFetched('chargeElements.chargePurposes.purposesUse')

  return chargeVersions
}

async function _fetchAndApplyReturns (billingPeriod, chargeVersion) {
  const { licenceRef, chargeElements } = chargeVersion

  for (const chargeElement of chargeElements) {
    const { chargePurposes } = chargeElement

    for (const chargePurpose of chargePurposes) {
      const legacyId = chargePurpose.purposesUse.legacyId

      chargePurpose.returns = await ReturnModel.query()
        .select([
          'returnId',
          'returnRequirement',
          'startDate',
          'endDate',
          'status',
          'metadata'
        ])
        .where('licenceRef', licenceRef)
        // water-abstraction-service filters out old returns in this way: `src/lib/services/returns/api-connector.js`
        .where('startDate', '>=', '2008-04-01')
        .where('startDate', '<=', billingPeriod.endDate)
        .where('endDate', '>=', billingPeriod.startDate)
        .whereJsonPath('metadata', '$.isTwoPartTariff', '=', true)
        .where(ref('metadata:purposes[0].tertiary.code').castInt(), legacyId)

      chargePurpose.returnStatus = chargePurpose.returns.map((matchedReturn) => {
        return matchedReturn.status
      })
    }
  }
}

function _matchChargeVersions (chargeVersions) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licenceId
  })

  const uniqueLicenceIds = [...new Set(allLicenceIds)]

  return uniqueLicenceIds.map((uniqueLicenceId) => {
    const matchedChargeVersions = chargeVersions.filter((chargeVersion) => {
      return chargeVersion.licenceId === uniqueLicenceId
    })

    return {
      licenceId: uniqueLicenceId,
      licenceRef: matchedChargeVersions[0].licenceRef,
      chargeVersions: matchedChargeVersions
    }
  })
}

function _friendlyResponse (_matchedChargeVersions) {
  return { hello: 'world' }
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Two part tariff matching complete', { timeTakenMs })
}

module.exports = {
  go
}
