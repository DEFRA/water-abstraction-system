'use strict'

/**
 * Allocate returns to charge elements
 * @module AllocateReturnsService
 */

const DetermineAbstractionPeriodService = require('./determine-abstraction-period.service.js')
const DetermineChargePeriodService = require('../../services/billing/supplementary/determine-charge-period.service.js')

function go (licences, billingPeriod) {
  licences.forEach((licence) => {
    const { chargeVersions, returns } = licence
    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
      chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          _prepChargeElement(chargeElement, chargeVersion.chargePeriod)
          _matchAndAllocate(chargeElement, returns)
        })
      })

      delete chargeVersion.licence
    })

    _determinePostAllocationReturnIssues(licence.returns)
  })

  return licences
}

function _prepChargeElement (chargeElement, chargePeriod) {
  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  const abstractionPeriod = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  chargeElement.issues = []
  chargeElement.returns = []
  chargeElement.allocatedQuantity = 0
  chargeElement.abstractionPeriod = abstractionPeriod
}

function _prepReturnsForMatching (returnRecords, billingPeriod) {
  returnRecords.forEach((returnRecord) => {
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnRecord
    const abstractionPeriod = DetermineAbstractionPeriodService.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    returnRecord.issues = _determinePreAllocationReturnIssues(returnRecord)
    returnRecord.chargeElements = []
    returnRecord.allocatedQuantity = 0
    returnRecord.abstractionPeriod = abstractionPeriod
  })
}

function _determinePreAllocationReturnIssues (returnRecord) {
  const issues = []

  if (returnRecord.underQuery) {
    issues.push('under query')
  }

  if (returnRecord.status !== 'completed') {
    issues.push(returnRecord.status)
  } else {
    if (returnRecord.versions[0] && returnRecord.versions[0].nilReturn) {
      issues.push('nil return')
    } else if (returnRecord.versions.length === 0 || returnRecord.versions[0].lines.length === 0) {
      issues.push('no lines')
    }
  }

  return issues
}

function _determinePostAllocationReturnIssues (returns) {
  returns.forEach((returnRecord) => {
    if (returnRecord.chargeElements.length === 0) {
      returnRecord.issues.push('no matching elements')
    }

    if (returnRecord.versions[0]) {
      const unallocated = returnRecord.versions[0].lines.some((line) => {
        return line.quantity > 0 && !line.allocated
      })

      if (unallocated) {
        returnRecord.issues.push('unallocated lines')
      }
    }
  })
}

function _matchAndAllocate (chargeElement, returns) {
  const matchedReturns = _matchReturns(chargeElement, returns)

  if (matchedReturns.length === 0) {
    chargeElement.issues.push({
      issue: 'no matching returns'
    })

    return
  }

  matchedReturns.forEach((matchedReturn) => {
    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
      const { returnId, returnRequirement, description } = matchedReturn

      if (matchedReturn.issues.length > 0) {
        const returnIssues = matchedReturn.issues.map((issue) => {
          return {
            returnId: matchedReturn.returnId,
            issue
          }
        })
        chargeElement.issues.push(...returnIssues)
        chargeElement.returns.push({ returnId, returnRequirement, description })
        matchedReturn.chargeElements.push({
          chargeElementId: chargeElement.chargePurposeId
        })

        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn)

      if (matchedLines.length === 0) {
        chargeElement.issues.push({
          returnId: matchedReturn.returnId,
          issue: 'no lines match'
        })
        chargeElement.returns.push({ returnId, returnRequirement, description })
        matchedReturn.chargeElements.push({
          chargeElementId: chargeElement.chargePurposeId
        })

        return
      }

      matchedLines.forEach((matchedLine) => {
        if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
          chargeElement.allocatedQuantity += matchedLine.quantity / 1000
          matchedLine.allocated = true

          matchedReturn.allocatedQuantity += matchedLine.quantity
        }
      })
      chargeElement.returns.push({ returnId, returnRequirement, description })
      matchedReturn.chargeElements.push({
        chargeElementId: chargeElement.chargePurposeId
      })
    }
  })

  if (chargeElement.allocatedQuantity === 0) {
    chargeElement.issues.push({
      issue: 'nothing allocated'
    })
  } else if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
    chargeElement.issues.push({
      issue: 'not fully allocated'
    })
  } else if (chargeElement.allocatedQuantity > chargeElement.authorisedAnnualQuantity) {
    chargeElement.issues.push({
      issue: 'over allocated'
    })
  }
}

function _matchLines (chargeElement, matchedReturn) {
  return matchedReturn.versions[0]?.lines.filter((line) => {
    if (line.allocated) {
      return false
    }

    const { startDate, endDate } = line
    return _periodsOverlap(chargeElement.abstractionPeriod, { startDate, endDate })
  })
}

function _matchReturns (chargeElement, returns) {
  const elementCode = chargeElement.purpose.legacyId
  const elementPeriod = chargeElement.abstractionPeriod

  return returns.filter((record) => {
    const { purposeCode: returnCode, abstractionPeriod: returnPeriod } = record

    if (elementCode !== returnCode) {
      return false
    }

    return _periodsOverlap(elementPeriod, returnPeriod)
  })
}

function _periodsOverlap (elementPeriod, returnPeriod) {
  if (returnPeriod.startDate > elementPeriod.startDate || elementPeriod.startDate > returnPeriod.endDate) {
    return false
  }

  return true
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
