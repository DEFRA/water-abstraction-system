'use strict'

/**
 * It saves stuff! (hopefully)
 * @module PersistAllocatedLicencesToResultsService
 */
const { generateUUID } = require('../../../lib/general.lib.js')
const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (billRunId, licences) {
  for (const licence of licences) {
    const { chargeVersions, returnLogs } = licence

    const reviewReturnResultIds = await _persistReviewReturnResults(returnLogs)
    // Cloning the returnLogs object so we can removed returns that have been matched
    const unpersistedReturns = [...returnLogs]

    for (const chargeVersion of chargeVersions) {
      const { chargeReferences } = chargeVersion

      for (const chargeReference of chargeReferences) {
        const { chargeElements } = chargeReference

        for (const chargeElement of chargeElements) {
          await _persistData(billRunId, licence, chargeVersion, chargeReference, chargeElement, reviewReturnResultIds, unpersistedReturns)
        }
      }
    }
    if (unpersistedReturns.length > 0) {
      await _persistUnmatchedReturns(unpersistedReturns, reviewReturnResultIds, billRunId, licence)
    }
  }
}

/**
 *
 * @param {*} returnLogs
 *
 * @returns {[]} - An array of the given returns with returnId and reviewReturnResultId
 */
async function _persistReviewReturnResults (returnLogs) {
  const reviewReturnResultIds = []

  for (const returnLog of returnLogs) {
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
    reviewReturnResultIds.push({ returnId: returnLog.id, reviewReturnResultId })
  }

  return reviewReturnResultIds
}

async function _persistData (billRunId, licence, chargeVersion, chargeReference, chargeElement, reviewReturnResultIds, unpersistedReturns) {
  const reviewChargeElementId = await _persistReviewChargeElementResult(chargeElement, chargeReference)

  await _persistReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementId, chargeElement, reviewReturnResultIds, unpersistedReturns)
}

/**
 * Persists review charge element result in the database
 * @param {*} chargeElement - The charge element object
 * @param {*} chargeReference - The charge reference object
 *
 * @returns {String} reviewChargeElementResultId - The ID of the persisted review charge element result
 */
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

/**
 * Persists review results associated with a charge element and returns in the database, once a return has been persisted it is removed from the unpersistedReturns
 *
 * @param {*} billRunId
 * @param {*} licence
 * @param {*} chargeVersion
 * @param {*} chargeReference
 * @param {*} reviewChargeElementId
 * @param {*} chargeElement
 * @param {[]} reviewReturnResultIds
 * @param {[]} unpersistedReturns
 */
async function _persistReviewResult (billRunId, licence, chargeVersion, chargeReference, reviewChargeElementId, chargeElement, reviewReturnResultIds, unpersistedReturns) {
  const data = {
    billRunId,
    licenceId: licence.id,
    chargeVersionId: chargeVersion.id,
    chargeReferenceId: chargeReference.id,
    chargePeriodStartDate: chargeVersion.chargePeriod.startDate,
    chargePeriodEndDate: chargeVersion.chargePeriod.endDate,
    chargeVersionChangeReason: chargeVersion.changeReason.description
  }

  if (chargeElement.returnLogs.length > 0) {
    data.reviewChargeElementResultId = reviewChargeElementId

    for (const returnLog of chargeElement.returnLogs) {
      const reviewReturnResultId = reviewReturnResultIds.find((reviewReturnResultIds) => {
        return reviewReturnResultIds.returnId === returnLog.returnId
      })

      data.reviewReturnResultId = reviewReturnResultId.reviewReturnResultId

      await ReviewResultModel.query().insert(data)

      // Removing the persisted returns
      for (let i = 0; i < unpersistedReturns.length; i++) {
        if (unpersistedReturns[i].id === returnLog.returnId) {
          unpersistedReturns.splice(i, 1)
        }
      }
    }
  } else {
    data.reviewChargeElementResultId = reviewChargeElementId

    await ReviewResultModel.query().insert(data)
  }
}

async function _persistUnmatchedReturns (unpersistedReturns, reviewReturnResultIds, billRunId, licence) {
  for (const unpersistedReturn of unpersistedReturns) {
    const data = {
      billRunId,
      licenceId: licence.id
    }

    const reviewReturnResultId = reviewReturnResultIds.find((reviewReturnResultId) => {
      return reviewReturnResultId.returnId === unpersistedReturn.id
    })

    data.reviewReturnResultId = reviewReturnResultId
    await ReviewResultModel.query().insert(data)
  }
}

module.exports = {
  go
}
