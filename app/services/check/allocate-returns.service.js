'use strict'

/**
 * Allocate returns to charge elements
 * @module AllocateReturnsService
 */

const DetermineAbstractionPeriodServices = require('./determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../../services/bill-runs/determine-charge-period.service.js')
const { periodsOverlap } = require('../../lib/general.lib.js')

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
            _matchAndAllocate(chargeElement, returns, chargeVersion.chargePeriod)
          })
        })
      }

      delete chargeVersion.licence
    })

    _determinePostAllocationReturnIssues(licence.returns)
  })

  return licences
}

function _abstractionOutsidePeriod (returnAbstractionPeriods, returnLine) {
  const { startDate, endDate } = returnLine

  return !periodsOverlap(returnAbstractionPeriods, [{ startDate, endDate }])
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

function _matchAndAllocate (chargeElement, returns, chargePeriod) {
  const matchedReturns = _matchReturns(chargeElement, returns)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      id: matchedReturn.id,
      allocatedQuantity: 0
    }
    const matchElementResult = {
      id: chargeElement.id,
      allocatedQuantity: 0
    }

    chargeElement.returns.push(matchedReturnResult)
    matchedReturn.chargeElements.push(matchElementResult)

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

          chargeElement.chargeDatesOverlap = _chargeDatesOverlap(matchedLine, chargePeriod)
          chargeElement.allocatedQuantity += qtyToAllocate
          matchedReturnResult.allocatedQuantity += qtyToAllocate
          matchElementResult.allocatedQuantity += qtyToAllocate

          matchedLine.unallocated -= qtyToAllocate
          matchedReturn.allocatedQuantity += qtyToAllocate
          chargeElement.lines.push({ id: matchedLine.id, lineId: matchedLine.lineId, allocated: qtyToAllocate })
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
    return periodsOverlap(chargeElement.abstractionPeriods, [{ startDate, endDate }])
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

    return periodsOverlap(elementPeriods, returnPeriods)
  })
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

    let quantity = 0
    let abstractionOutsidePeriod = false

    returnRecord.versions[0]?.lines.forEach((line, lineIndex) => {
      line.id = `L${lineIndex + 1}-${returnRecord.id}`

      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, line)
      }

      line.unallocated = line.quantity / 1000
      quantity += line.unallocated
    })

    returnRecord.issues = []
    returnRecord.chargeElements = []
    returnRecord.quantity = quantity
    returnRecord.allocatedQuantity = 0
    returnRecord.abstractionOutsidePeriod = abstractionOutsidePeriod
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
