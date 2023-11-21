'use strict'

/**
 * Match and allocate licences to returns for a two-part tariff bill run for the given billing periods
 * @module MatchAndAllocateService
 */

const DetermineAbstractionPeriodService = require('../../check/determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const FetchReturnsForLicenceService = require('./fetch-returns-for-licence.service.js')

/**
 * Functionality not yet implemented
 */
async function go (billRun, billingPeriods, licenceId) {
  const startTime = process.hrtime.bigint()

  _calculateAndLogTime(startTime)

  // --- Group by licence and find the matching returns for them
  const licences = await FetchLicencesService.go(billRun.regionId, billingPeriods[0], licenceId)

  await _matchReturnsToLicences(licences, billingPeriods[0])

  // ---- ???

  _prepare(licences, billingPeriods[0])
  _allocate(licences, billingPeriods[0])

  return licences
}

function _allocate (licences, billingPeriod) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          _matchAndAllocate(chargeElement, returns)

          // PERSIST element ???
        })
      })
    })

    // PERSIST returns
  })
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Two part tariff matching complete', { timeTakenMs })
}

function _checkReturnForIssues (returnRecord) {
  if (returnRecord.underQuery) {
    return true
  }

  if (returnRecord.status !== 'completed') {
    return true
  }

  if (returnRecord.versions.length === 0 || returnRecord.versions[0].lines.length === 0) {
    return true
  }

  if (returnRecord.versions[0].nilReturn) {
    return true
  }

  return false
}

function _matchAndAllocate (chargeElement, returns) {
  const matchedReturns = _matchReturns(chargeElement, returns)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      returnId: matchedReturn.returnId,
      allocatedQuantity: 0
    }

    chargeElement.returns.push(matchedReturnResult)

    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
      if (_checkReturnForIssues(matchedReturn)) {
        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn.versions[0].lines)

      if (matchedLines.length === 0) {
        return
      }

      matchedLines.forEach((matchedLine) => {
        const remainingAllocation = chargeElement.authorisedAnnualQuantity - chargeElement.allocatedQuantity
        if (remainingAllocation > 0) {
          // We default how much to allocate to what is unallocated on the line i.e. remaining >= line.unallocated
          let qtyToAllocate = matchedLine.unallocated

          // If what remains is actually less than the line we instead set qtyToAllocate to what remains
          if (remainingAllocation < matchedLine.unallocated) {
            qtyToAllocate = remainingAllocation
          }

          chargeElement.allocatedQuantity += qtyToAllocate
          matchedReturnResult.allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
        }
      })
    }
  })
}

function _matchLines (chargeElement, returnLines) {
  return returnLines.filter((returnLine) => {
    if (returnLine.unallocated === 0) {
      return false
    }

    const { startDate, endDate } = returnLine
    return _periodsOverlap(chargeElement.abstractionPeriods, [{ startDate, endDate }])
  })
}

function _matchReturns (chargeElement, returns) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriods = chargeElement.abstractionPeriods

  return returns.filter((record) => {
    const returnPeriods = record.abstractionPeriods

    const matchFound = record.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    if (!matchFound) {
      return false
    }

    return _periodsOverlap(elementPeriods, returnPeriods)
  })
}
async function _matchReturnsToLicences (licences, billingPeriod) {
  for (const licence of licences) {
    licence.returns = await FetchReturnsForLicenceService.go(licence.licenceRef, billingPeriod)
  }
}

function _periodsOverlap (elementPeriods, returnPeriods) {
  for (const elementPeriod of elementPeriods) {
    const overLappingPeriods = returnPeriods.filter((returnPeriod) => {
      if (returnPeriod.startDate > elementPeriod.endDate || elementPeriod.startDate > returnPeriod.endDate) {
        return false
      }

      return true
    })

    if (overLappingPeriods.length) {
      return true
    }
  }

  return false
}

function _prepare (licences, billingPeriod) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence

    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
      chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

      // NOTE: Imagine the scenario where a billing account change is due to happen. The users will create a new charge
      // version whose start date will be when the account is due to change, for example 1 Oct. So, the charge version
      // we are looking at has a `startDate:` of 2023-10-01. But then someone marks the licence as revoked in NALD on
      // 2023-08-01. In this scenario DetermineChargePeriodService will return an empty charge period because it will
      // have calculated the charge period start date as 2023-10-01 and the end date as 2023-08-01. Clearly, this is
      // incompatible so the service actually returns `{ startDate: null, endDate: null }`. This check is to handle
      // scenarios like this
      if (chargeVersion.chargePeriod.startDate) {
        chargeReferences.forEach((chargeReference) => {
          const { chargeElements } = chargeReference

          _prepChargeElementsForMatching(chargeElements, chargeVersion.chargePeriod)
        })
      }
    })
  })
}

function _prepChargeElementsForMatching (chargeElements, chargePeriod) {
  chargeElements.forEach((chargeElement) => {
    const {
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth
    } = chargeElement

    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      chargePeriod,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth,
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth
    )

    chargeElement.returns = []
    chargeElement.allocatedQuantity = 0
    chargeElement.abstractionPeriods = abstractionPeriods
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

    let totalQty = 0
    returnRecord.versions[0]?.lines.forEach((line) => {
      line.unallocated = line.quantity / 1000
      totalQty += line.unallocated
    })

    returnRecord.allocatedQuantity = 0
    returnRecord.totalQuantity = totalQty
    returnRecord.abstractionPeriods = abstractionPeriods
  })
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
