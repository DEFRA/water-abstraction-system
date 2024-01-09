'use strict'

/**
 * Persists the results from the `allocateReturnsToLicenceService` into the DB
 * @module PersistAllocatedLicenceToResultsService
 */

const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (billRunId, licence) {
  const { chargeVersions, returnLogs } = licence

  const reviewReturnResultIds = await _persistReturnLogs(returnLogs, billRunId, licence)

  for (const chargeVersion of chargeVersions) {
    const { chargeReferences } = chargeVersion

    for (const chargeReference of chargeReferences) {
      const { chargeElements } = chargeReference

      for (const chargeElement of chargeElements) {
        await _persistChargeElement(
          billRunId,
          licence,
          chargeVersion,
          chargeReference,
          chargeElement,
          reviewReturnResultIds
        )
      }
    }
  }
}

async function _persistChargeElement (
  billRunId,
  licence,
  chargeVersion,
  chargeReference,
  chargeElement,
  reviewReturnResultIds
) {
  const reviewChargeElementResultId = await _persistReviewChargeElementResult(chargeElement, chargeReference)

  // Persisting the charge elements that have a matching return
  if (chargeElement.returnLogs.length > 0) {
    for (const returnLog of chargeElement.returnLogs) {
      // When we persist the review result we need the Id's for both the charge element and return log's review result
      // records. Though it looks like we're iterating return logs here, these are copies assigned during matching and
      // allocation. We don't create `ReviewReturnResult` records until this service is called, and those are based
      // on the `returnLogs` property of each licence. Hence, we need to pass in the ID's created and search them for
      // a match in order to get the `reviewReturnResultId`.
      const { reviewReturnResultId } = reviewReturnResultIds.find((reviewReturnResultIds) => {
        return reviewReturnResultIds.returnId === returnLog.returnId
      })

      await _persistReviewResult(
        billRunId,
        licence,
        chargeVersion,
        chargeReference,
        reviewChargeElementResultId,
        reviewReturnResultId
      )
    }
  } else {
    // Persisting the charge element without any matching returns
    await _persistReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementResultId, null)
  }
}

async function _persistReturnLogs (returnLogs, billRunId, licence) {
  const reviewReturnResultIds = []

  for (const returnLog of returnLogs) {
    const reviewReturnResultId = await _persistReviewReturnResult(returnLog)
    reviewReturnResultIds.push({ returnId: returnLog.id, reviewReturnResultId })

    // Persisting the unmatched return logs
    if (returnLog.matched === false) {
      _persistReviewResult(billRunId, licence, null, null, null, reviewReturnResultId)
    }
  }

  return reviewReturnResultIds
}

async function _persistReviewChargeElementResult (chargeElement, chargeReference) {
  const data = {
    chargeElementId: chargeElement.id,
    allocated: chargeElement.allocatedQuantity,
    aggregate: chargeReference.aggregate ?? 1,
    chargeDatesOverlap: chargeElement.chargeDatesOverlap
  }

  const { id: reviewChargeElementResultId } = await ReviewChargeElementResultModel.query().insert(data).returning('id')

  return reviewChargeElementResultId
}

async function _persistReviewResult (
  billRunId,
  licence,
  chargeVersion,
  chargeReference,
  reviewChargeElementResultId,
  reviewReturnResultId
) {
  const data = {
    billRunId,
    licenceId: licence.id,
    chargeVersionId: chargeVersion?.id,
    chargeReferenceId: chargeReference?.id,
    chargePeriodStartDate: chargeVersion?.chargePeriod.startDate,
    chargePeriodEndDate: chargeVersion?.chargePeriod.endDate,
    chargeVersionChangeReason: chargeVersion?.changeReason.description,
    reviewChargeElementResultId,
    reviewReturnResultId
  }

  await ReviewResultModel.query().insert(data)
}

async function _persistReviewReturnResult (returnLog) {
  const data = {
    returnId: returnLog.id,
    returnReference: returnLog.returnRequirement,
    startDate: returnLog.startDate,
    endDate: returnLog.endDate,
    dueDate: returnLog.dueDate,
    receivedDate: returnLog.receivedDate,
    status: returnLog.status,
    underQuery: returnLog.underQuery,
    nilReturn: returnLog.nilReturn,
    description: returnLog.description,
    purposes: returnLog.purposes,
    quantity: returnLog.quantity,
    allocated: returnLog.allocatedQuantity,
    abstractionOutsidePeriod: returnLog.abstractionOutsidePeriod
  }

  const { id: reviewReturnResultId } = await ReviewReturnResultModel.query().insert(data).returning('id')

  return reviewReturnResultId
}

module.exports = {
  go
}
