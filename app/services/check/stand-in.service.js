'use strict'

/**
 * Not a real service! Contains stand-ins for services currently being built as part of the two-part tariff refactoring
 * @module CheckController
 */

const DetermineAbstractionPeriodService = require('../bill-runs/determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../bill-runs/determine-charge-period.service.js')
const FetchChargeVersionsService = require('../bill-runs/two-part-tariff/fetch-charge-versions.service.js')
const FetchReturnLogsForLicenceService = require('../bill-runs/two-part-tariff/fetch-return-logs-for-licence.service.js')
const { periodsOverlap } = require('../../lib/general.lib.js')

// =====================================================================================================================
// AllocateReturnsToLicenceService stand-in code
// Delete when real service is merged

const allocateReturnsToLicencesService = {
  go: _allocateReturnsToLicences
}

function _allocateReturnsToLicences (licences) {
  licences.forEach((licence) => {
    const { chargeVersions, returnLogs } = licence

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          _matchAndAllocate(chargeElement, returnLogs, chargeVersion.chargePeriod, chargeReference)
        })
      })
    })
  })
}

function _chargeDatesOverlap (matchedLine, chargePeriod) {
  const { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate } = chargePeriod
  const { startDate: lineStartDate, endDate: lineEndDate } = matchedLine

  if (lineStartDate < chargePeriodEndDate && lineEndDate > chargePeriodEndDate) {
    return true
  }

  if (lineStartDate < chargePeriodStartDate && lineEndDate > chargePeriodStartDate) {
    return true
  }

  return false
}

function _checkReturnForIssues (returnRecord) {
  if (returnRecord.nilReturn) {
    return true
  }

  if (returnRecord.underQuery) {
    return true
  }

  if (returnRecord.status !== 'completed') {
    return true
  }

  if (returnRecord.returnSubmissions.length === 0 || returnRecord.returnSubmissions[0].returnSubmissionLines.length === 0) {
    return true
  }

  return false
}

function _matchAndAllocate (chargeElement, returnLogs, chargePeriod, chargeReference) {
  const matchedReturns = _matchReturns(chargeElement, returnLogs)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      returnId: matchedReturn.id,
      allocatedQuantity: 0,
      lines: []
    }

    chargeElement.returnLogs.push(matchedReturnResult)
    matchedReturn.matched = true

    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity && chargeReference.allocatedQuantity < chargeReference.volume) {
      if (_checkReturnForIssues(matchedReturn)) {
        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn.returnSubmissions[0].returnSubmissionLines)

      if (matchedLines.length === 0) {
        return
      }

      matchedLines.forEach((matchedLine) => {
        const remainingAllocation = chargeElement.authorisedAnnualQuantity - chargeElement.allocatedQuantity
        if (remainingAllocation > 0) {
          // We default how much to allocate to what is unallocated on the line i.e. remaining >= line.unallocated
          let qtyToAllocate = matchedLine.unallocated

          // If what remains is actually less than the line we instead set qtyToAllocate to what remains. We check this
          // on both the chargeReference and the element
          const chargeReferenceRemainingAllocation = chargeReference.volume - chargeReference.allocatedQuantity

          if (qtyToAllocate > chargeReferenceRemainingAllocation) {
            qtyToAllocate = chargeReferenceRemainingAllocation
          } else if (remainingAllocation < matchedLine.unallocated) {
            qtyToAllocate = remainingAllocation
          }

          chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
          chargeElement.allocatedQuantity += qtyToAllocate
          matchedReturnResult.allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
          chargeReference.allocatedQuantity += qtyToAllocate
          matchedReturnResult.lines.push({ id: matchedLine.id, allocated: qtyToAllocate })
        }
      })
    }
  })
}

function _matchLines (chargeElement, returnSubmissionLines) {
  return returnSubmissionLines.filter((returnSubmissionLine) => {
    if (returnSubmissionLine.unallocated === 0) {
      return false
    }

    const { startDate, endDate } = returnSubmissionLine
    return periodsOverlap(chargeElement.abstractionPeriods, [{ startDate, endDate }])
  })
}

function _matchReturns (chargeElement, returnLogs) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriods = chargeElement.abstractionPeriods

  return returnLogs.filter((record) => {
    const returnPeriods = record.abstractionPeriods

    const matchFound = record.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    if (!matchFound) {
      return false
    }

    return periodsOverlap(elementPeriods, returnPeriods)
  })
}

// =====================================================================================================================
// FetchLicencesService stand-in code
// Delete when real service is merged
const fetchLicencesService = {
  go: _fetchLicences
}

async function _fetchLicences (regionId, billingPeriod, identifier, type) {
  const chargeVersions = await FetchChargeVersionsService.go(regionId, billingPeriod)

  const uniqueLicenceIds = _extractUniqueLicenceIds(chargeVersions)

  return _groupByLicence(chargeVersions, uniqueLicenceIds)
}

function _extractUniqueLicenceIds (chargeVersions) {
  const allLicenceIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licence.id
  })

  return [...new Set(allLicenceIds)]
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
      return chargeVersion.licence.id === licenceId
    })

    const { licenceRef, startDate, expiredDate, lapsedDate, revokedDate } = matchedChargeVersions[0].licence

    licences[i] = {
      id: licenceId,
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

// =====================================================================================================================
// PrepareLicencesForAllocationService stand-in code
// Delete when real service is merged
const prepareLicencesForAllocationService = {
  go: _prepareLicencesForAllocation
}

async function _prepareLicencesForAllocation (licences, billingPeriod) {
  for (const licence of licences) {
    licence.returnLogs = await FetchReturnLogsForLicenceService.go(licence.licenceRef, billingPeriod)

    const { chargeVersions, returnLogs } = licence

    _prepReturnsForMatching(returnLogs, billingPeriod)

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
  }
}

function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
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

    chargeElement.returnLogs = []
    chargeElement.allocatedQuantity = 0
    chargeElement.abstractionPeriods = abstractionPeriods
  })
}

function _prepReturnsForMatching (returnLogs, billingPeriod) {
  returnLogs.forEach((returnLog) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth, returnSubmissions } = returnLog
    const abstractionPeriods = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    let quantity = 0
    let abstractionOutsidePeriod = false

    returnSubmissions[0]?.returnSubmissionLines.forEach((returnSubmissionLine) => {
      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, returnSubmissionLine)
      }
      returnSubmissionLine.unallocated = returnSubmissionLine.quantity / 1000
      quantity += returnSubmissionLine.unallocated
    })

    returnLog.nilReturn = returnSubmissions[0]?.nilReturn ?? false
    returnLog.quantity = quantity
    returnLog.allocatedQuantity = 0
    returnLog.abstractionPeriods = abstractionPeriods
    returnLog.abstractionOutsidePeriod = abstractionOutsidePeriod
    returnLog.matched = false
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
  allocateReturnsToLicencesService,
  fetchLicencesService,
  prepareLicencesForAllocationService
}
