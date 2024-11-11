'use strict'

/**
 * Deletes all data relating to a review licence from the review tables
 * @module RemoveReviewLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Deletes all data relating to a review licence from the review tables
 *
 * @param {string} reviewLicenceId - The UUID of the review licence that is being removed from the bill run
 */
async function go(reviewLicenceId) {
  await _removeChargeElementReturns(reviewLicenceId)
  await _removeReturns(reviewLicenceId)
  await _removeChargeElements(reviewLicenceId)
  await _removeChargeReferences(reviewLicenceId)
  await _removeChargeVersions(reviewLicenceId)
  await _removeLicence(reviewLicenceId)
}

async function _removeChargeElements (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewChargeElements AS rce')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.id', reviewLicenceId)
}

async function _removeChargeElementReturns (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewChargeElementReturns AS rcer')
    .innerJoin('reviewChargeElements AS rce', 'rcer.reviewChargeElementId', 'rce.id')
    .innerJoin('reviewChargeReferences AS rcr', 'rce.reviewChargeReferenceId', 'rcr.id')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.id', reviewLicenceId)
}

async function _removeChargeReferences (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewChargeReferences AS rcr')
    .innerJoin('reviewChargeVersions AS rcv', 'rcr.reviewChargeVersionId', 'rcv.id')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.id', reviewLicenceId)
}

async function _removeChargeVersions (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewChargeVersions AS rcv')
    .innerJoin('reviewLicences AS rl', 'rcv.reviewLicenceId', 'rl.id')
    .where('rl.id', reviewLicenceId)
}

async function _removeLicence (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewLicences')
    .where('id', reviewLicenceId)
}

async function _removeReturns (reviewLicenceId) {
  await db
    .withSchema('water')
    .del()
    .from('reviewReturns AS rr')
    .innerJoin('reviewLicences AS rl', 'rr.reviewLicenceId', 'rl.id')
    .where('rl.id', reviewLicenceId)
}

module.exports = {
  go
}
