'use strict'

/**
 * Persists the results from the `allocateReturnsToLicenceService` into the DB
 * @module PersistAllocatedLicencesToResultsService
 */
const { generateUUID } = require('../../../lib/general.lib.js')
const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

/**
 * Persists the returnLogs and chargeElements processed from the `allocateReturnsToLicenceService`
 *
 * @param {String} billRunId UUID of the bill run this bill will be linked to
 * @param {Object[]} licences licences with returns data to persist
 *
 */
async function go (billRunId, licences) {
  for (const licence of licences) {
    const { chargeVersions, returnLogs } = licence

    await _persistReturnLogs(returnLogs, billRunId, licence)

    for (const chargeVersion of chargeVersions) {
      const { chargeReferences } = chargeVersion

      for (const chargeReference of chargeReferences) {
        const { chargeElements } = chargeReference

        for (const chargeElement of chargeElements) {
          await _persistChargeElement(billRunId, licence, chargeVersion, chargeReference, chargeElement)
        }
      }
    }
  }
}

async function _persistChargeElement (billRunId, licence, chargeVersion, chargeReference, chargeElement) {
  const reviewChargeElementResultId = await _persistReviewChargeElementResult(chargeElement, chargeReference)

  // Persisting the charge elements that have a matching return
  if (chargeElement.returnLogs.length > 0) {
    for (const chargeElementReturnLog of chargeElement.returnLogs) {
      await _persistReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementResultId, chargeElementReturnLog.reviewReturnResultId)
    }
  } else {
    // Persisting the charge element without any matching returns
    await _persistReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementResultId, null)
  }
}

async function _persistReturnLogs (returnLogs, billRunId, licence) {
  for (const returnLog of returnLogs) {
    await _persistReviewReturnResult(returnLog)

    // Persists the unmatched return logs. The matched return logs will be persisted when processing the charge elements
    if (returnLog.matched === false) {
      _persistReviewResult(billRunId, licence, null, null, null, returnLog.reviewReturnResultId)
    }
  }
}

async function _persistReviewChargeElementResult (chargeElement, chargeReference) {
  const reviewChargeElementResultId = generateUUID()

  const data = {
    id: reviewChargeElementResultId,
    chargeElementId: chargeElement.id,
    allocated: chargeElement.allocatedQuantity,
    aggregate: chargeReference.aggregate ?? 1,
    chargeDatesOverlap: chargeElement.chargeDatesOverlap
  }

  await ReviewChargeElementResultModel.query().insert(data)

  return reviewChargeElementResultId
}

async function _persistReviewResult (billRunId, licence, chargeVersion, chargeReference, reviewChargeElementResultId, reviewReturnResultId) {
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
    id: returnLog.reviewReturnResultId,
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

  await ReviewReturnResultModel.query().insert(data)
}

module.exports = {
  go
}
