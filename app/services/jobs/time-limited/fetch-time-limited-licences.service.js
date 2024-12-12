'use strict'

/**
 * Fetches licences that have a related charge element that is due to expire in less than 50 days
 * @module FetchTimeLimitedLicencesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches licences that have a related charge element that is due to expire in less than 50 days
 *
 * To be selected the licence must
 *
 * - not have expired
 * - not be revoked
 * - not have lapsed
 * - have an 'sroc' charge version with the status of `current` that does not have an `endDate`. The lack of an endDate
 * indicates that the charge version is the latest and has not been replaced/superseded etc
 * - not be linked to a licence in the workflow
 * - have a related `purpose` that is due to expire in less than 50 days
 *
 * @returns {Promise<object[]>} The licence IDs with time-limited elements and their current licence version ID (needed
 * else we break the workflow). Also the ID of the charge version that has the time limited charge element
 */
async function go() {
  // NOTE: We've resorted to Knex rather than Objection JS due to just how many JOINS we need to get from licence to
  // charge purposes! Our Objection JS skills failed us as we could not get the query to work using innerJoinRelated()
  return db
    .distinct('l.id', 'lv.id AS licenceVersionId', 'cv.id AS chargeVersionId')
    .from('licences as l')
    .innerJoin('licenceVersions as lv', 'l.id', 'lv.licenceId')
    .innerJoin('chargeVersions as cv', 'l.id', 'cv.licenceId')
    .innerJoin('chargeReferences as cr', 'cv.id', 'cr.chargeVersionId')
    .innerJoin('chargeElements as ce', 'cr.id', 'ce.chargeReferenceId')
    .where((builder) => {
      builder.whereNull('l.expiredDate').orWhere('l.expiredDate', '>', new Date())
    })
    .whereNull('l.revokedDate')
    .whereNull('l.lapsedDate')
    .where('lv.status', 'current')
    .whereNull('cv.endDate')
    .where('cv.scheme', 'sroc')
    .where('cv.status', 'current')
    .whereNotNull('ce.timeLimitedEndDate')
    .where('ce.timeLimitedEndDate', '<', _offSetCurrentDateByDays(50))
    .whereNotExists(db.select(1).from('workflows as w').whereColumn('l.id', 'w.licenceId').whereNull('w.deletedAt'))
}

function _offSetCurrentDateByDays(days) {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return date
}

module.exports = {
  go
}
