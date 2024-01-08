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
 * Persists results of matching and allocating return logs to licence charge elements for a two-part tariff bill run
 *
 * Each licence will have a `returnLogs` property that contains all return logs linked to the licence for the billing
 * period of the bill run. It will also have a `chargeVersions` property, which within each one it will have details of
 * which charge elements matched to which return logs and whether anything was allocated to the charge element from
 * them.
 *
 * We need to persist all this information ready for use in the review screens that our users use to asses if the
 * matching and allocating looks correct or if any issues need resolving first.
 *
 * @param {String} billRunId - the ID of the two-part tariff bill run being generated
 * @param {Object[]} licences - the two-part tariff licences included in the bill run, along with their match and
 *  allocation results
 */
async function go (billRunId, licences) {
  for (const licence of licences) {
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
  const reviewReturnResultId = generateUUID()

  const data = {
    id: reviewReturnResultId,
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

  return reviewReturnResultId
}

module.exports = {
  go
}
