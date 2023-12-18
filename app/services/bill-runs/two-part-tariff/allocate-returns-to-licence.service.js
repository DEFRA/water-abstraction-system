'use strict'

/**
 * Do stuff
 * @module AllocateReturnsToLicenceService
 */

const { generateUUID, periodsOverlap } = require('../../../lib/general.lib.js')
const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (licences, billRunID) {
  licences.forEach((licence) => {
    const { chargeVersions, returnLogs } = licence

    returnLogs.forEach((returnLog) => {
      // PERSIST returns
      const reviewReturnResultId = generateUUID()

      const returnResultToPersist = {
        id: reviewReturnResultId,
        returnId: returnLog.id,
        returnReference: returnLog.returnReference,
        startDate: returnLog.start_date,
        endDate: returnLog.endDate,
        dueDate: returnLog.dueDate,
        receivedDate: returnLog.receivedDate,
        status: returnLog.status,
        underQuery: returnLog.underQuery,
        nilReturn: returnLog.nilReturn,
        description: returnLog.description,
        purposes: returnLog.purposes,
        quantity: returnLog.quantity,
        allocated: returnLog.allocated, // Set at 0, need to update
        abstractionOutsidePeriod: returnLog.abstractionOutsidePeriod
      }

      returnLog.reviewReturnResultId = reviewReturnResultId

      _persistDataToReviewReturnResult(returnResultToPersist)
    })

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        chargeReference.allocatedQuantity = 0

        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const reviewChargeElementResultId = generateUUID()
          _matchAndAllocate(chargeElement, returnLogs, chargeVersion.chargePeriod, chargeReference, reviewChargeElementResultId, billRunID, licence, chargeVersion)

          // PERSIST element ???

          const chargeElementToPersist = {
            id: reviewChargeElementResultId,
            chargeElementId: chargeElement.id,
            allocated: chargeElement.allocated,
            aggregate: chargeReference.aggregate,
            chargeDatesOverlap: chargeElement.chargeDatesOverlap
          }

          _persistDataToReviewChargeElementResult(chargeElementToPersist)

          // returnLogs.forEach((returnLog) => {
          //   _persistReviewResult(billRunID, licence.id, chargeVersion.id, chargeVersion.chargePeriod, chargeVersion.changeReason.description, chargeReference.id, reviewChargeElementResultId) // missing review return results id
          // })
        })
      })
    })
  })
}

async function _persistReviewResult (billRunID, licenceId, chargeVersionId, chargePeriod, chargeVersionChangeReason, chargeReferenceId, reviewChargeElementResultId, reviewReturnResultId) {
  const data = {
    billRunID,
    licenceId,
    chargeVersionId,
    chargePeriodStartDate: chargePeriod.startDate,
    chargePeriodEndDate: chargePeriod.endDate,
    chargeVersionChangeReason,
    chargeReferenceId,
    reviewChargeElementResultId,
    reviewReturnResultId
  }

  await ReviewResultModel.query().insert(data)
}

async function _persistDataToReviewChargeElementResult (chargeElementToPersist) {
  await ReviewChargeElementResultModel.query().insert(chargeElementToPersist)
}

async function _persistDataToReviewReturnResult (dataToPersist) {
  await ReviewReturnResultModel.query().insert(dataToPersist)
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

async function _matchedAndPersisted (chargeElement, returnLogs, reviewChargeElementResultId, chargeReference, billRunID, licence, chargeVersion) {
  returnLogs.forEach((record) => {
    let matchFound
    const elementCode = chargeElement.purpose.legacyId
    const elementPeriods = chargeElement.abstractionPeriods

    const returnPeriods = record.abstractionPeriods

    matchFound = record.purposes.some((purpose) => {
      return purpose.tertiary.code === elementCode
    })

    matchFound = periodsOverlap(elementPeriods, returnPeriods)
    if (!matchFound) {
      _persistReviewResult(billRunID, licence.id, chargeVersion.id, chargeVersion.chargePeriod, chargeVersion.changeReason.description, chargeReference.id, null, record.reviewReturnResultId) // missing review return results id
      return
    }

    _persistReviewResult(billRunID, licence.id, chargeVersion.id, chargeVersion.chargePeriod, chargeVersion.changeReason.description, chargeReference.id, reviewChargeElementResultId, record.reviewReturnResultId) // missing review return results id
  })
}

function _matchAndAllocate (chargeElement, returnLogs, chargePeriod, chargeReference, reviewChargeElementResultId, billRunID, licence, chargeVersion) {
  _matchedAndPersisted(chargeElement, returnLogs, reviewChargeElementResultId, chargePeriod, chargeReference, billRunID, licence, chargeVersion)
  const matchedReturns = _matchReturns(chargeElement, returnLogs)

  if (matchedReturns.length === 0) {
    return
  }

  matchedReturns.forEach((matchedReturn) => {
    const matchedReturnResult = {
      returnId: matchedReturn.id,
      allocatedQuantity: 0
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

module.exports = {
  go
}
