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
    const { chargeVersions, returns } = licence

    const reviewReturnResults = _generateReviewReturnResults(returns)

    chargeVersions.forEach((chargeVersion) => {
      const { chargeReferences } = chargeVersion

      chargeReferences.forEach((chargeReference) => {
        const { chargeElements } = chargeReference

        chargeElements.forEach((chargeElement) => {
          const reviewChargeElementResult = _generateReviewChargeElement(chargeElement)

          if (chargeElement.returns.length > 0) {
            chargeElement.returns.forEach((matchedReturn) => {
              const matchReviewReturnResult = reviewReturnResults.find((reviewReturnResult) => {
                return reviewReturnResult.returnId === matchedReturn.returnId
              })

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
  })

  return reviewResults
}

function _generateReviewResult (billRun, licence, chargeVersion, chargeReference, reviewChargeElementResult, reviewReturnResult) {
  const attributes = {
    id: generateUUID(),
    billRunId: billRun.billingBatchId,
    licenceId: licence.licenceId,
    chargeVersionId: chargeVersion.chargeVersionId,
    chargeReferenceId: chargeReference.chargeElementId,
    reviewChargeElementResultId: reviewChargeElementResult.id,
    reviewChargeElementResult,
    reviewReturnResultId: reviewReturnResult.id,
    reviewReturnResult
  }

  return ReviewResultModel.fromJson(attributes)
}

function _generateReviewChargeElement (chargeElement) {
  const { chargeElementId } = chargeElement

  const attributes = {
    id: generateUUID(),
    chargeElementId
  }

  return ReviewChargeElementResultModel.fromJson(attributes)
}

function _generateReviewReturnResults (returnLogs) {
  return returnLogs.map((returnLog) => {
    const { returnId } = returnLog

    const attributes = {
      id: generateUUID(),
      returnId
    }

    return ReviewReturnResultModel.fromJson(attributes)
  })
}

module.exports = {
  go
}
