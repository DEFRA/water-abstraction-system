'use strict'

/**
 * It saves stuff! (hopefully)
 * @module PersistDataService
 */
const { generateUUID } = require('../../../lib/general.lib.js')
const ReviewChargeElementResultModel = require('../../../models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../models/review-return-result.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (billRunId, licences) {
  let unmatchedReturns = []
  let reviewReturnResultIds

  for (const licence of licences) {
    const { chargeVersions, returnLogs } = licence

    reviewReturnResultIds = await _persistReturnLogs(returnLogs)
    unmatchedReturns = returnLogs

    for (const chargeVersion of chargeVersions) {
      const { chargeReferences } = chargeVersion
      let i = 0

      for (const chargeReference of chargeReferences) {
        i++
        const { chargeElements } = chargeReference

        for (const chargeElement of chargeElements) {
          const matchedReturnLogs = chargeElement.returnLogs

          await _persistData(billRunId, licence, chargeVersion, chargeReference, chargeElement, reviewReturnResultIds, matchedReturnLogs, unmatchedReturns)
        }

        if (chargeReferences.length === i) {
          await _persistUnmatchedReturns(unmatchedReturns, reviewReturnResultIds, billRunId, licence, chargeVersion, chargeReference)
        }
      }
    }
  }
}

async function _persistReturnLogs (returnLogs) {
  const reviewReturnResultIds = []

  for (const returnLog of returnLogs) {
    const reviewReturnResultId = generateUUID()

    console.log('Return :', returnLog)
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

async function _persistData (billRunId, licence, chargeVersion, chargeReference, chargeElement, reviewReturnResultIds, matchedReturnLogs, returnLogs) {
  const reviewChargeElementId = await _persistChargeElement(chargeElement, chargeReference)

  await _persistsReviewResult(billRunId, licence, chargeVersion, chargeReference, reviewChargeElementId, chargeElement, reviewReturnResultIds, matchedReturnLogs, returnLogs)
}

async function _persistChargeElement (chargeElement, chargeReference) {
  const reviewChargeELementResultId = generateUUID()

  const data = {
    id: reviewChargeELementResultId,
    chargeElementId: chargeElement.id,
    allocated: chargeElement.allocated,
    aggregate: chargeReference.aggregate ?? 1,
    chargeDatesOverlap: chargeElement.chargeDatesOverlap
  }

  await ReviewChargeElementResultModel.query().insert(data)

  return reviewChargeELementResultId
}

async function _persistsReviewResult (billRunId, licence, chargeVersion, chargeReference, reviewChargeElementId, chargeElement, reviewReturnResultIds, matchedReturnLogs, unmatchedReturns) {
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
      const reviewReturnResultId = reviewReturnResultIds.find(returnId => returnId.returnId === returnLog.returnId)
      for (let i = 0; i < unmatchedReturns.length; i++) {
        if (unmatchedReturns[i].id === returnLog.returnId) {
          unmatchedReturns.splice(i, 1)
        }
      }

      data.reviewReturnResultId = reviewReturnResultId.reviewReturnResultId

      await ReviewResultModel.query().insert(data)
    }
  } else {
    data.reviewChargeELementId = reviewChargeElementId

    console.log('Persisting Charge Element if no returns')
    await ReviewResultModel.query().insert(data)
  }
}

async function _persistUnmatchedReturns (unmatchedReturns, reviewReturnResultIds, billRunId, licence, chargeVersion, chargeReference) {
  if (unmatchedReturns.length > 0) {
    for (const unmatchedReturn of unmatchedReturns) {
      const data = {
        billRunId,
        licenceId: licence.id,
        chargeVersionId: chargeVersion.id,
        chargeReferenceId: chargeReference.id,
        chargePeriodStartDate: chargeVersion.chargePeriod.startDate,
        chargePeriodEndDate: chargeVersion.chargePeriod.endDate,
        chargeVersionChangeReason: chargeVersion.changeReason.description
      }

      const reviewReturnResultId = reviewReturnResultIds.find(reviewReturnResultId => reviewReturnResultId.reviewReturnResultId === unmatchedReturn.returnId)
      data.reviewReturnResultId = reviewReturnResultId

      await ReviewResultModel.query().insert(data)
    }
  }
}

module.exports = {
  go
}
