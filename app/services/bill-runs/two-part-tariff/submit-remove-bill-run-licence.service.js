'use strict'

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage
 * @module SubmitRemoveBillRunLicenceService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { db } = require('../../../../db/db.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage
 *
 * It does this by deleting all of the persisted data relating to the licence from the review tables. The licence will
 * then be flagged for 2PT supplementary billing. If after removing a licence the bill run is empty, the bill run status
 * will be set to `empty` and `true` returned so that the user is redirected back to the Bill runs page rather
 * than Review bill run.
 *
 * @param {string} billRunId - The UUID of the bill run that the licence is in
 * @param {string} licenceId - UUID of the licence to remove from the bill run
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<boolean>} true if all the licences have been removed from the bill run else false
 */
async function go (billRunId, licenceId, yar) {
  await _removeChargeElementReturns(billRunId, licenceId)
  await _removeReturns(billRunId, licenceId)
  await _removeChargeElements(billRunId, licenceId)
  await _removeChargeReferences(billRunId, licenceId)
  await _removeChargeVersions(billRunId, licenceId)
  await _removeLicence(billRunId, licenceId)

  const licenceRef = await _flagForSupplementaryBilling(licenceId)

  const allLicencesRemoved = await _allLicencesRemoved(billRunId)

  if (!allLicencesRemoved) {
    // NOTE: The banner message is only set if licences remain in the bill run. This is because if there are no longer
    // any licences remaining in the bill run the user is redirected to the "Bill runs" page instead of
    // "Review licences". As the banner isn't displayed on the "Bill runs" page the message would remain in the cookie.
    yar.flash('banner', `Licence ${licenceRef} removed from the bill run.`)
  }

  return allLicencesRemoved
}

async function _allLicencesRemoved (billRunId) {
  const count = await ReviewLicenceModel.query().where('billRunId', billRunId).resultSize()

  if (count === 0) {
    await BillRunModel.query().findById(billRunId).patch({ status: 'empty' })

    return true
  }

  return false
}

async function _removeChargeElements (billRunId, licenceId) {
  return db
    .del()
    .from('reviewChargeElements AS rce')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeElementReturns (billRunId, licenceId) {
  return db
    .del()
    .from('reviewChargeElementsReturns AS rcer')
    .innerJoin('reviewChargeElements AS rce', 'rcer.reviewChargeElementId', 'rce.id')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeReferences (billRunId, licenceId) {
  return db
    .del()
    .from('reviewChargeReferences AS rcr')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeVersions (billRunId, licenceId) {
  return db
    .del()
    .from('reviewChargeVersions AS rcv')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeLicence (billRunId, licenceId) {
  return db
    .del()
    .from('reviewLicences')
    .where('billRunId', billRunId)
    .andWhere('licenceId', licenceId)
}

async function _removeReturns (billRunId, licenceId) {
  return db
    .del()
    .from('reviewReturns AS rr')
    .innerJoin('reviewLicences AS rl', 'rr.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', billRunId)
    .andWhere('rl.licenceId', licenceId)
}

async function _flagForSupplementaryBilling (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .patch({ includeInSrocTptBilling: true })
    .returning('licenceRef')

  return licence.licenceRef
}

module.exports = {
  go
}
