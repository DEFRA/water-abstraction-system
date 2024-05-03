'use strict'

/**
 * Deletes all of the persisted data relating to the bill and licence from the review tables.
 * @module RemoveReviewDataService
 */

const { db } = require('../../../../db/db.js')

/**
 * Deletes all of the persisted data relating to the bill and licence from the review tables
 *
 * @param {string} billRunId - The UUID of the bill run that the licence is in
 * @param {string} licenceId - UUID of the licence to remove from the review tables
 */
async function go (billRunId, licenceId) {
  await _removeChargeElementReturns(billRunId, licenceId)
  await _removeReturns(billRunId, licenceId)
  await _removeChargeElements(billRunId, licenceId)
  await _removeChargeReferences(billRunId, licenceId)
  await _removeChargeVersions(billRunId, licenceId)
  await _removeLicence(billRunId, licenceId)
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

module.exports = {
  go
}
