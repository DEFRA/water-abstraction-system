'use strict'

/**
 * Allocate returns to charge elements
 * @module AllocateReturnsService
 */

const DetermineAbstractionPeriodServices = require('./determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../../services/bill-runs/determine-charge-period.service.js')

function go (licences, billingPeriod) {
  licences.forEach((licence, licenceIndex) => {
    licence.id = `L${licenceIndex + 1}`

    const { chargeVersions, returns } = licence
    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion, chargeVersionIndex) => {
      chargeVersion.id = `V${chargeVersionIndex + 1}-${licence.id}`

      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
      chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

      if (chargeVersion.chargePeriod.startDate) {
        chargeReferences.forEach((chargeReference, chargeReferenceIndex) => {
          chargeReference.id = `R${chargeReferenceIndex + 1}-${chargeVersion.id}`
          if (!chargeReference.aggregate) {
            chargeReference.aggregate = 1
          }

          const { chargeElements } = chargeReference

          chargeElements.forEach((chargeElement, chargeElementIndex) => {
            chargeElement.id = `E${chargeElementIndex + 1}-${chargeReference.id}`

            _prepChargeElement(chargeElement, chargeVersion.chargePeriod)
            _matchAndAllocate(chargeElement, returns)
          })
        })
      }

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

  const abstractionPeriods = DetermineAbstractionPeriodServices.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  chargeElement.issues = []
  chargeElement.returns = []
  chargeElement.lines = []
  chargeElement.allocatedQuantity = 0
  chargeElement.abstractionPeriods = abstractionPeriods
}

function _prepReturnsForMatching (returnRecords, billingPeriod) {
  returnRecords.forEach((returnRecord, returnRecordIndex) => {
    returnRecord.id = `T${returnRecordIndex + 1}`

    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnRecord
    const abstractionPeriods = DetermineAbstractionPeriodServices.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    returnRecord.versions[0]?.lines.forEach((line, lineIndex) => {
      line.id = `L${lineIndex + 1}-${returnRecord.id}`
      line.unallocated = line.quantity / 1000
    })

    returnRecord.issues = _determinePreAllocationReturnIssues(returnRecord)
    returnRecord.chargeElements = []
    returnRecord.allocatedQuantity = 0
    returnRecord.abstractionPeriods = abstractionPeriods
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
        return line.quantity > 0 && line.unallocated > 0
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
      const { id: returnTestId, returnId, returnRequirement, description } = matchedReturn

      if (matchedReturn.issues.length > 0) {
        const returnIssues = matchedReturn.issues.map((issue) => {
          return {
            returnId: matchedReturn.returnId,
            issue
          }
        })
        chargeElement.issues.push(...returnIssues)
        chargeElement.returns.push({ returnTestId, returnId, returnRequirement, description })
        matchedReturn.chargeElements.push({
          id: chargeElement.id,
          chargeElementId: chargeElement.chargePurposeId
        })

        return
      }

      const matchedLines = _matchLines(chargeElement, matchedReturn)

      if (matchedLines.length === 0) {
        chargeElement.issues.push({
          id: matchedReturn.id,
          returnId: matchedReturn.returnId,
          issue: 'no lines match'
        })
        chargeElement.returns.push({ returnTestId, returnId, returnRequirement, description })
        matchedReturn.chargeElements.push({
          id: chargeElement.id,
          chargeElementId: chargeElement.chargePurposeId
        })

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
          chargeElement.lines.push({ id: matchedLine.id, lineId: matchedLine.lineId, allocated: qtyToAllocate })

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
        }
      })
      chargeElement.returns.push({ returnTestId, returnId, returnRequirement, description })
      matchedReturn.chargeElements.push({
        id: chargeElement.id,
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
      issue: 'under allocated'
    })
  } else if (chargeElement.allocatedQuantity > chargeElement.authorisedAnnualQuantity) {
    chargeElement.issues.push({
      issue: 'over allocated'
    })
  }
}

function _matchLines (chargeElement, matchedReturn) {
  return matchedReturn.versions[0]?.lines.filter((line, lineIndex) => {
    if (line.unallocated === 0) {
      return false
    }

    const { startDate, endDate } = line
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
