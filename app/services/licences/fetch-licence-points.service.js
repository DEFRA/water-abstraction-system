'use strict'

/**
 * Fetches the licence instance and its related licenceVersionPurposePoints data needed for the licence points page
 * @module FetchLicencePointsService
 */

const LicenceModel = require('../../models/licence.model.js')

const { db } = require('../../../db/db.js')

/**
 * Fetches the licence instance and its related licenceVersionPurposePoints data needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<module:LicenceModel>} The licence instance and related licenceVersionPurposePoints data needed for
 * the licence purposes page
 */
async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)
  const points = await _fetchPoints(licenceId)

  return {
    licence,
    points
  }
}

async function _fetchLicence (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(
      'id',
      'licenceRef'
    )
}

async function _fetchPoints (licenceId) {
  const points = await db
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
    .innerJoin('sources AS s', 'p.source_id', 's.id')
    .whereIn('p.id', function () {
      this.select('lvpp.point_id')
        .from('licence_version_purpose_points as lvpp')
        .innerJoin('licence_version_purposes as lvp', 'lvp.id', 'lvpp.licence_version_purpose_id')
        .innerJoin('licence_versions as lv', 'lv.id', 'lvp.licence_version_id')
        .innerJoin('licences as l', 'l.id', 'lv.licence_id')
        .where('l.id', licenceId)
        .andWhere('lv.status', 'current')
    })
    .orderBy('p.description')

  return points
}

module.exports = {
  go
}
