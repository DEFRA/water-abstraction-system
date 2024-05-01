'use strict'

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage
 * @module SubmitRemoveBillRunLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Orchestrates removing a licence from a bill run whilst it is at the review stage. It does this by deleting all of the
 * persisted data relating to the licence from the review tables. The licence will then be flagged for 2PT supplementary
 * billing. If after removing a licence the bill run is empty, the bill run status will be set to set to `empty`.
 *
 * @param {string} billRunId - The UUID of the bill run that the licence is in
 * @param {string} licenceId UUID of the licence to remove from the bill run
 * @param {Object} sessionManager - The Hapi `request.yar` session manager passed on by the controller
 */
async function go (billRunId, licenceId, yar) {
  await _removeChargeElementReturns(billRunId, licenceId)
  await _removeReturns(billRunId, licenceId)
  await _removeChargeElements(billRunId, licenceId)
  await _removeChargeReferences(billRunId, licenceId)
  await _removeChargeVersions(billRunId, licenceId)
  await _removeLicence(billRunId, licenceId)

  const licenceRef = await _setSupBillingTrueAndReturnRef(licenceId)

  const allLicencesRemoved = await _allLicencesRemoved(billRunId, licenceRef, yar)

  return allLicencesRemoved
}

async function _allLicencesRemoved (billRunId, licenceRef, yar) {
  const { licenceCount } = await db
    .count('id AS licenceCount')
    .from('reviewLicences')
    .where('billRunId', billRunId)
    .first()

  if (licenceCount === 0) {
    await db
      .update('status', 'empty')
      .from('billRuns')
      .where('id', billRunId)

    return true
  }

  // NOTE: The banner message is only set if licences remain in the bill run. This is because if there are no longer any
  // licences remaining in the bill run the user is redirected to the "Bill runs" page instead of "Review licences". As
  // the banner isn't displayed on the "Bill runs" page the message would remain in the cookie which could cause issues.
  yar.flash('banner', `Licence ${licenceRef} removed from the bill run.`)

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

async function _setSupBillingTrueAndReturnRef (licenceId) {
  const licence = await db
    .update('includeInSrocTptBilling', true)
    .from('licences')
    .where('id', licenceId)
    .returning('licenceRef')

  return licence[0].licenceRef
}

module.exports = {
  go
}
