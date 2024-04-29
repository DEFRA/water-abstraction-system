'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the remove bill run licence confirmation page
 * @module RemoveBillRunLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id - The UUID of the bill run that the licence is in
 * @param {string} licenceId UUID of the licence to remove from the bill run
 * @param {Object} sessionManager - The Hapi `request.yar` session manager passed on by the controller
 */
async function go (id, licenceId, yar) {
  await _removeChargeElementReturns(id, licenceId)
  await _removeReturns(id, licenceId)
  await _removeChargeElements(id, licenceId)
  await _removeChargeReferences(id, licenceId)
  await _removeChargeVersions(id, licenceId)
  await _removeLicence(id, licenceId)

  const licenceRef = await _setSupBillingTrueAndReturnRef(licenceId)

  const allLicencesRemoved = await _allLicencesRemoved(id, licenceRef, yar)

  return allLicencesRemoved
}

async function _allLicencesRemoved (id, licenceRef, yar) {
  const { licenceCount } = await db
    .count('id AS licenceCount')
    .from('reviewLicences')
    .where('billRunId', id)
    .first()

  if (licenceCount === 0) {
    await db
      .update('status', 'empty')
      .from('billRuns')
      .where('id', id)

    return true
  }

  // NOTE: The banner message is only set if licences remain in the bill run. This is because if there are no longer any
  // licences remaining in the bill run the user is redirected to the "Bill runs" page instead of "Review licences". As
  // the banner isn't displayed on the "Bill runs" page the message would remain in the cookie which could cause issues.
  yar.flash('banner', `Licence ${licenceRef} removed from the bill run.`)

  return false
}

async function _removeChargeElements (id, licenceId) {
  return db
    .del()
    .from('reviewChargeElements AS rce')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', id)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeElementReturns (id, licenceId) {
  return db
    .del()
    .from('reviewChargeElementsReturns AS rcer')
    .innerJoin('reviewChargeElements AS rce', 'rcer.reviewChargeElementId', 'rce.id')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', id)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeReferences (id, licenceId) {
  return db
    .del()
    .from('reviewChargeReferences AS rcr')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', id)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeChargeVersions (id, licenceId) {
  return db
    .del()
    .from('reviewChargeVersions AS rcv')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', id)
    .andWhere('rl.licenceId', licenceId)
}

async function _removeLicence (id, licenceId) {
  return db
    .del()
    .from('reviewLicences')
    .where('billRunId', id)
    .andWhere('licenceId', licenceId)
}

async function _removeReturns (id, licenceId) {
  return db
    .del()
    .from('reviewReturns AS rr')
    .innerJoin('reviewLicences AS rl', 'rr.reviewLicenceId', 'rl.id')
    .where('rl.billRunId', id)
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
