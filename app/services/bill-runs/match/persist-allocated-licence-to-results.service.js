'use strict'

/**
 * Persists the results from the `allocateReturnsToChargeElementService` into the DB
 * @module PersistAllocatedLicenceToResultsService
 */

const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')
const ReviewChargeElementReturnModel = require('../../../models/review-charge-element-return.model.js')
const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')
const ReviewChargeVersionModel = require('../../../models/review-charge-version.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const ReviewReturnModel = require('../../../models/review-return.model.js')

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
 * @param {string} billRunId - the ID of the two-part tariff bill run being generated
 * @param {module:LicenceModel} licence - the two-part tariff licence included in the bill run, along with their match
 * and allocation results
 */
async function go (billRunId, licence) {
  const { chargeVersions, returnLogs } = licence

  const reviewLicenceId = await _persistLicenceData(licence, billRunId)
  const reviewReturnIds = await _persistReturnLogs(returnLogs, reviewLicenceId)

  for (const chargeVersion of chargeVersions) {
    const reviewChargeVersionId = await _persistChargeVersion(chargeVersion, reviewLicenceId)

    const { chargeReferences } = chargeVersion

    for (const chargeReference of chargeReferences) {
      const reviewChargeReferenceId = await _persistChargeReference(chargeReference, reviewChargeVersionId)

      const { chargeElements } = chargeReference

      for (const chargeElement of chargeElements) {
        await _persistChargeElement(chargeElement, reviewReturnIds, reviewChargeReferenceId)
      }
    }
  }
}

async function _persistChargeElement (chargeElement, reviewReturnIds, reviewChargeReferenceId) {
  const reviewChargeElementId = await _persistReviewChargeElement(chargeElement, reviewChargeReferenceId)

  for (const returnLog of chargeElement.returnLogs) {
    // When we persist the review result we need the Id's for both the charge element and return log's review result
    // records. Though it looks like we're iterating return logs here, these are copies assigned during matching and
    // allocation. We don't create `ReviewReturn` records until this service is called, and those are based
    // on the `returnLogs` property of each licence. Hence, we need to pass in the ID's created and search them for
    // a match in order to get the `reviewReturnId`.
    const { reviewReturnId } = reviewReturnIds.find((reviewReturn) => {
      return reviewReturn.returnId === returnLog.returnId
    })

    await _persistChargeElementsReturns(reviewChargeElementId, reviewReturnId)
  }
}

async function _persistChargeElementsReturns (reviewChargeElementId, reviewReturnId) {
  const data = {
    reviewChargeElementId,
    reviewReturnId
  }

  await ReviewChargeElementReturnModel.query().insert(data)
}

async function _persistChargeReference (chargeReference, reviewChargeVersionId) {
  const data = {
    reviewChargeVersionId,
    chargeReferenceId: chargeReference.id,
    aggregate: chargeReference.aggregate ?? 1,
    amendedAggregate: chargeReference.aggregate ?? 1,
    chargeAdjustment: chargeReference.charge ?? 1,
    amendedChargeAdjustment: chargeReference.charge ?? 1,
    winterDiscount: chargeReference.winter,
    abatementAgreement: chargeReference.s126 ?? 1,
    twoPartTariffAgreement: chargeReference.s127,
    canalAndRiverTrustAgreement: chargeReference.s130,
    authorisedVolume: chargeReference.volume,
    amendedAuthorisedVolume: chargeReference.volume
  }

  const { id: reviewChargeReferenceId } = await ReviewChargeReferenceModel.query().insert(data).returning('id')

  return reviewChargeReferenceId
}

async function _persistChargeVersion (chargeVersion, reviewLicenceId) {
  const data = {
    reviewLicenceId,
    chargeVersionId: chargeVersion.id,
    changeReason: chargeVersion.changeReason.description,
    chargePeriodStartDate: chargeVersion.chargePeriod.startDate,
    chargePeriodEndDate: chargeVersion.chargePeriod.endDate
  }

  const { id: reviewChargeVersionId } = await ReviewChargeVersionModel.query().insert(data).returning('id')

  return reviewChargeVersionId
}

async function _persistLicenceData (licence, billRunId) {
  const data = {
    billRunId,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licenceHolder: licence.licenceHolder,
    status: licence.status,
    issues: licence.issues.join(', ')
  }

  const { id: reviewLicenceId } = await ReviewLicenceModel.query().insert(data).returning('id')

  return reviewLicenceId
}

async function _persistReturnLogs (returnLogs, reviewLicenceId) {
  const reviewReturnIds = []

  for (const returnLog of returnLogs) {
    const reviewReturnId = await _persistReviewReturn(returnLog, reviewLicenceId)

    reviewReturnIds.push({ returnId: returnLog.id, reviewReturnId })
  }

  return reviewReturnIds
}

async function _persistReviewChargeElement (chargeElement, reviewChargeReferenceId) {
  const data = {
    reviewChargeReferenceId,
    chargeElementId: chargeElement.id,
    allocated: chargeElement.allocatedQuantity,
    amendedAllocated: chargeElement.allocatedQuantity,
    chargeDatesOverlap: chargeElement.chargeDatesOverlap,
    issues: chargeElement.issues.join(', '),
    status: chargeElement.status
  }

  const { id: reviewChargeElementId } = await ReviewChargeElementModel.query().insert(data).returning('id')

  return reviewChargeElementId
}

async function _persistReviewReturn (returnLog, reviewLicenceId) {
  const data = {
    returnId: returnLog.id,
    reviewLicenceId,
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
