'use strict'

/**
 * Fetches the points data needed for the points page
 * @module FetchPointsService
 */

const { db } = require('../../../db/db.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Fetches the points data needed for the points page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object[]>} An object containing the points data needed for the points page
 */
async function go(licenceId) {
  return _fetchPoints(licenceId)
}

async function _fetchPoints(licenceId) {
  return db
    .distinct()
    .select(
      'p.bgsReference',
      'p.category',
      'p.depth',
      'p.description',
      'p.hydroInterceptDistance',
      'p.hydroReference',
      'p.hydroOffsetDistance',
      'p.id AS pointId',
      'p.locationNote',
      'p.ngr1',
      'p.ngr2',
      'p.ngr3',
      'p.ngr4',
      'p.note',
      'p.primaryType',
      'p.secondaryType',
      'p.wellReference',
      's.description AS sourceDescription',
      's.sourceType'
    )
    .from('points AS p')
    .innerJoin('sources AS s', 'p.sourceId', 's.id')
    .whereIn('p.id', function () {
      this.select('lvpp.pointId')
        .from('licenceVersion_purpose_points as lvpp')
        .innerJoin('licenceVersion_purposes as lvp', 'lvp.id', 'lvpp.licenceVersionPurposeId')
        .innerJoin('licenceVersions as lv', 'lv.id', 'lvp.licenceVersionId')
        .innerJoin('licences as l', 'l.id', 'lv.licenceId')
        .where('l.id', licenceId)
        .andWhere('lv.status', 'current')
        .andWhere('lv.startDate', '<=', timestampForPostgres())
    })
    .orderBy('p.description')
}

module.exports = {
  go
}
