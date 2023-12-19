'use strict'

/**
 * Hack service to figure out how we transform our results to results!
 * @module TransformAllocatedLicencesToResultsService
 */

const { generateUUID } = require('../../../lib/general.lib.js')
const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')

function go (billRun, licences) {
  const reviewResults = []

  licences.forEach((licence) => {
    const { chargeVersions, returnLogs } = licence

    const reviewReturnResults = _generateReviewReturnResults(returnLogs)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const reviewChargeElementResult = _generateReviewChargeElement(chargeElement, chargeReference)

          if (chargeElement.returnLogs.length > 0) {
            chargeElement.returnLogs.forEach((matchedReturnLog) => {
              const matchReviewReturnResult = _matchingReviewReturnResult(reviewReturnResults, matchedReturnLog)

              const reviewResult = _generateReviewResult(billRun, licence, chargeVersion, chargeReference, reviewChargeElementResult, matchReviewReturnResult)
              reviewResults.push(reviewResult)
            })
          } else {
            const reviewResult = _generateReviewResult(billRun, licence, chargeVersion, chargeReference, reviewChargeElementResult, null)
            reviewResults.push(reviewResult)
          }
        })
      })
    })
    const unmatchedReviewResults = _generateReviewResultsForUnmatchedReturns(billRun, licence, returnLogs, reviewReturnResults)
    reviewResults.push(...unmatchedReviewResults)
  })

  return reviewResults
}

function _matchingReviewReturnResult (reviewReturnResults, returnLog) {
  return reviewReturnResults.find((reviewReturnResult) => {
    return reviewReturnResult.returnId === returnLog.returnId
  })
}

function _generateReviewResultsForUnmatchedReturns (billRun, licence, returnLogs, reviewReturnResults) {
  const unmatchedReturnLogs = returnLogs.filter((returnLog) => {
    return !returnLog.matched
  })

  return unmatchedReturnLogs.map((unmatchedReturnLog) => {
    const matchReviewReturnResult = _matchingReviewReturnResult(reviewReturnResults, unmatchedReturnLog)
    return _generateReviewResult(billRun, licence, null, null, null, matchReviewReturnResult)
  })
}

function _generateReviewResult (billRun, licence, chargeVersion, chargeReference, reviewChargeElementResult, reviewReturnResult) {
  const attributes = {
    id: generateUUID(),
    billRunId: billRun.billingBatchId,
    licenceId: licence.id,
    chargeVersionId: chargeVersion.id,
    chargeReferenceId: chargeReference.id,
    chargePeriodStartDate: chargeVersion.chargePeriod.startDate,
    chargePeriodEndDate: chargeVersion.chargePeriod.endDate,
    chargeVersionChangeReason: chargeVersion.changeReason.description,
    reviewChargeElementResultId: reviewChargeElementResult.id,
    reviewChargeElementResult,
    reviewReturnResultId: reviewReturnResult.id,
    reviewReturnResult
  }

  return ReviewResultModel.fromJson(attributes)
}

function _generateReviewChargeElement (chargeElement, chargeReference) {
  const { id: chargeElementId, allocatedQuantity: allocated, chargeDatesOverlap } = chargeElement
  const { aggregate } = chargeReference

  const attributes = {
    id: generateUUID(),
    chargeElementId,
    allocated,
    aggregate: aggregate ?? 1,
    chargeDatesOverlap
  }

  return ReviewChargeElementResultModel.fromJson(attributes)
}

function _generateReviewReturnResults (returnLogs) {
  return returnLogs.map((returnLog) => {
    const { id: returnId, returnRequirement: reference, startDate, endDate, dueDate, receivedDate, status, underQuery, nilReturn, description, purposes, quantity, allocatedQuantity: allocated, abstractionOutsidePeriod } = returnLog

    const attributes = {
      id: generateUUID(),
      returnId,
      reference,
      startDate,
      endDate,
      dueDate,
      receivedDate,
      status,
      underQuery,
      nilReturn,
      description,
      purposes,
      quantity,
      allocated,
      abstractionOutsidePeriod
    }

    return ReviewReturnResultModel.fromJson(attributes)
  })
}

module.exports = {
  go
}
