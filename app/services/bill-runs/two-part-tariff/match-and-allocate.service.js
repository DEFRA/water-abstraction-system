'use strict'

/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

const DetermineAbstractionPeriodService = require('../../check/determine-abstraction-periods.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchReturnsForLicenceService = require('./fetch-returns-for-licence.service.js')
const RegionModel = require('../../../models/water/region.model.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  _calculateAndLogTime(startTime)

  // --- Group by licence and find the matching returns for them

  const regionCode = await _regionCode(billRun)

  const chargeVersions = await FetchChargeVersionsService.go(regionCode, billingPeriods[0], licenceId)

  const uniqueLicenceIds = _extractUniqueLicenceIds(chargeVersions)

  const licences = _groupByLicence(chargeVersions, uniqueLicenceIds)

  await _matchReturnsToLicences(licences, billingPeriods[0])

  // ---- ???

  _allocate(licences, billingPeriods[0])

  return licences
}

function _allocate (licences, billingPeriod) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence

    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion, chargeVersionIndex) => {
      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
    })
  })
}

function _prepReturnsForMatching (returnRecords, billingPeriod) {
  returnRecords.forEach((returnRecord) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnRecord
    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    returnRecord.versions[0]?.lines.forEach((line) => {
      line.unallocated = line.quantity / 1000
    })

    returnRecord.abstractionPeriods = abstractionPeriods
  })
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Two part tariff matching complete', { timeTakenMs })
}

function _extractUniqueLicenceIds (chargeVersions) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.licenceId
  })

  return [...new Set(allLicenceIds)]
}

async function _matchReturnsToLicences (licences, billingPeriod) {
  for (const licence of licences) {
    licence.returns = await FetchReturnsForLicenceService.go(licence.licenceRef, billingPeriod)
  }
}

function _groupByLicence (chargeVersions, uniqueLicenceIds) {
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

    licences[i] = {
      licenceId,
      licenceRef,
      startDate,
      expiredDate,
      lapsedDate,
      revokedDate,
      chargeVersions: matchedChargeVersions
    }
  }

  return licences
}

async function _regionCode (billRun) {
  const { naldRegionId } = await RegionModel.query().findById(billRun.regionId).select('naldRegionId')

  return naldRegionId
}

function _sortChargeReferencesBySubsistenceCharge (chargeReferences) {
  return chargeReferences.sort((firstChargeReference, secondChargeReference) => {
    const { subsistenceCharge: subsistenceChargeFirst } = firstChargeReference.chargeCategory
    const { subsistenceCharge: subsistenceChargeSecond } = secondChargeReference.chargeCategory

    if (subsistenceChargeFirst > subsistenceChargeSecond) {
      return -1
    }

    if (subsistenceChargeFirst < subsistenceChargeSecond) {
      return 1
    }

    return 0
  })
}

module.exports = {
  go
}
