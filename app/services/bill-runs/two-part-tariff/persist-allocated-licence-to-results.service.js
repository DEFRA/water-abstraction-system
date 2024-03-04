'use strict'

/**
 * Persists the results from the `allocateReturnsToChargeElementService` into the DB
 * @module PersistAllocatedLicenceToResultsService
 */

const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')
const ReviewReturnModel = require('../../../models/review-return.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

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
 * @param {module:LicenceModel} licence - the two-part tariff licence included in the bill run, along with their match and
 *  allocation results
 */
async function go (billRunId, licence) {
  const { chargeVersions, returnLogs } = licence

  _persistLicenceData(licence, billRunId)
  const reviewReturnIds = await _persistReturnLogs(returnLogs, billRunId, licence)

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
          reviewReturnIds
        )
      }
    }
  }
}

async function _persistLicenceData (licence, billRunId) {
  const data = {
    billRunId,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licenceHolder: licence.licenceHolder,
    status: licence.status
  }

  await ReviewLicenceModel.query().insert(data)
}

// Change the helpers!!!!!

async function _persistChargeElement (
  billRunId,
  licence,
  chargeVersion,
  chargeReference,
  chargeElement,
  reviewReturnIds
) {
  const reviewChargeElementId = await _persistReviewChargeElement(chargeElement, chargeReference)

  // Persisting the charge elements that have a matching return
  if (chargeElement.returnLogs.length > 0) {
    for (const returnLog of chargeElement.returnLogs) {
      // When we persist the review result we need the Id's for both the charge element and return log's review result
      // records. Though it looks like we're iterating return logs here, these are copies assigned during matching and
      // allocation. We don't create `ReviewReturn` records until this service is called, and those are based
      // on the `returnLogs` property of each licence. Hence, we need to pass in the ID's created and search them for
      // a match in order to get the `reviewReturnId`.
      const { reviewReturnId } = reviewReturnIds.find((reviewReturnIds) => {
        return reviewReturnIds.returnId === returnLog.returnId
      })

      await _persistReviewResult(
        billRunId,
        licence,
        chargeVersion,
        chargeReference,
        reviewChargeElementId,
        reviewReturnId
      )
    }
  } else {
    // Persisting the charge element without any matching returns
    await _persistReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementId, null)
  }
}

async function _persistReturnLogs (returnLogs, billRunId, licence) {
  const reviewReturnIds = []

  for (const returnLog of returnLogs) {
    const reviewReturnId = await _persistReviewReturn(returnLog)
    reviewReturnIds.push({ returnId: returnLog.id, reviewReturnId })

    // Persisting the unmatched return logs
    if (returnLog.matched === false) {
      _persistReviewResult(billRunId, licence, null, null, null, reviewReturnId)
    }
  }

  return reviewReturnIds
}

async function _persistReviewChargeElement (chargeElement, chargeReference) {
  const data = {
    chargeElementId: chargeElement.id,
    allocated: chargeElement.allocatedQuantity,
    aggregate: chargeReference.aggregate ?? 1,
    chargeDatesOverlap: chargeElement.chargeDatesOverlap
  }

  const { id: reviewChargeElementId } = await ReviewChargeElementModel.query().insert(data).returning('id')

  return reviewChargeElementId
}

async function _persistReviewResult (
  billRunId,
  licence,
  chargeVersion,
  chargeReference,
  reviewChargeElementId,
  reviewReturnId
) {
  const data = {
    billRunId,
    licenceId: licence.id,
    chargeVersionId: chargeVersion?.id,
    chargeReferenceId: chargeReference?.id,
    chargePeriodStartDate: chargeVersion?.chargePeriod.startDate,
    chargePeriodEndDate: chargeVersion?.chargePeriod.endDate,
    chargeVersionChangeReason: chargeVersion?.changeReason.description,
    reviewChargeElementId,
    reviewReturnId
  }

  await ReviewResultModel.query().insert(data)
}

async function _persistReviewReturn (returnLog) {
  const data = {
    returnId: returnLog.id,
    returnReference: returnLog.returnReference,
    startDate: returnLog.startDate,
    endDate: returnLog.endDate,
    dueDate: returnLog.dueDate,
    receivedDate: returnLog.receivedDate,
    returnStatus: returnLog.status,
    underQuery: returnLog.underQuery,
    nilReturn: returnLog.nilReturn,
    description: returnLog.description,
    purposes: returnLog.purposes,
    quantity: returnLog.quantity,
    allocated: returnLog.allocatedQuantity,
    abstractionOutsidePeriod: returnLog.abstractionOutsidePeriod,
    issues: returnLog.issues.join(', ')
  }

  const { id: reviewReturnId } = await ReviewReturnModel.query().insert(data).returning('id')

  return reviewReturnId
}

module.exports = {
  go
}
