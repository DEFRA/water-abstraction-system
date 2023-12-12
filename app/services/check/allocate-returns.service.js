'use strict'

/**
 * Allocate returns to charge elements
 * @module AllocateReturnsService
 */

const DetermineAbstractionPeriodServices = require('./determine-abstraction-periods.service.js')
const DetermineChargePeriodService = require('../../services/bill-runs/determine-charge-period.service.js')
const DetermineIssuesService = require('./determine-issues.service.js')
const { periodsOverlap } = require('../../lib/general.lib.js')

function go (licences, billingPeriod) {
  licences.forEach((licence, licenceIndex) => {
    licence.simpleId = `L${licenceIndex + 1}`

    const { chargeVersions, returns } = licence
    _prepReturnsForMatching(returns, billingPeriod)

    chargeVersions.forEach((chargeVersion, chargeVersionIndex) => {
      chargeVersion.simpleId = `V${chargeVersionIndex + 1}-${licence.simpleId}`

      const { chargeReferences } = chargeVersion

      _sortChargeReferencesBySubsistenceCharge(chargeReferences)
      chargeVersion.chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

      if (chargeVersion.chargePeriod.startDate) {
        chargeReferences.forEach((chargeReference, chargeReferenceIndex) => {
          chargeReference.simpleId = `R${chargeReferenceIndex + 1}-${chargeVersion.simpleId}`
          if (!chargeReference.aggregate) {
            chargeReference.aggregate = 1
          }

          const { chargeElements } = chargeReference

          chargeElements.forEach((chargeElement, chargeElementIndex) => {
            chargeElement.simpleId = `E${chargeElementIndex + 1}-${chargeReference.simpleId}`

            _prepChargeElement(chargeElement, chargeVersion.chargePeriod)
            _matchAndAllocate(chargeElement, returns, chargeVersion.chargePeriod)
          })
        })
      }

      delete chargeVersion.licence
    })

    DetermineIssuesService.go(licence)
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

function _matchAndAllocate (chargeElement, returns, chargePeriod) {
  const matchedReturns = _matchReturns(chargeElement, returns)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      simpleId: matchedReturn.simpleId,
      id: matchedReturn.id,
      allocatedQuantity: 0,
      lines: []
    }
    const matchElementResult = {
      simpleId: chargeElement.simpleId,
      id: chargeElement.id,
      allocatedQuantity: 0
    }

    chargeElement.returns.push(matchedReturnResult)
    matchedReturn.chargeElements.push(matchElementResult)

    if (chargeElement.allocatedQuantity < chargeElement.authorisedAnnualQuantity) {
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
          matchedReturnResult.lines.push({ simpleId: matchedLine.simpleId, id: matchedLine.id, allocated: qtyToAllocate })
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

  chargeElement.returns = []
  chargeElement.allocatedQuantity = 0
  chargeElement.abstractionPeriods = abstractionPeriods
}

function _prepReturnsForMatching (returnRecords, billingPeriod) {
  returnRecords.forEach((returnRecord, returnRecordIndex) => {
    returnRecord.simpleId = `T${returnRecordIndex + 1}`

    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth, returnSubmissions } = returnRecord
    const abstractionPeriods = DetermineAbstractionPeriodServices.go(
      billingPeriod,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )

    let quantity = 0
    let abstractionOutsidePeriod = false

    returnSubmissions[0]?.returnSubmissionLines.forEach((line, lineIndex) => {
      line.simpleId = `L${lineIndex + 1}-${returnRecord.simpleId}`

      if (!abstractionOutsidePeriod) {
        abstractionOutsidePeriod = _abstractionOutsidePeriod(abstractionPeriods, line)
      }

      line.unallocated = line.quantity / 1000
      quantity += line.unallocated
    })

    returnRecord.nilReturn = returnSubmissions[0]?.nilReturn ?? false
    returnRecord.quantity = quantity
    returnRecord.allocatedQuantity = 0
    returnRecord.abstractionOutsidePeriod = abstractionOutsidePeriod
    returnRecord.abstractionPeriods = abstractionPeriods
    returnRecord.chargeElements = []
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
