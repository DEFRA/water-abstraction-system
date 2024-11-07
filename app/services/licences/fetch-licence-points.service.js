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
    .select(
      'p.id AS pointId',
      'p.category',
      'p.note',
      'p.primaryType',
      'p.secondaryType',
      'p.description AS pointDescription',
      'p.locationNote',
      'p.depth',
      'p.ngr1',
      'p.ngr2',
      'p.ngr3',
      'p.ngr4',
      'p.bgsReference',
      'p.wellReference',
      'p.hydroReference',
      'p.hydroOffsetDistance',
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

// async function _fetch (licenceId) {
//   return LicenceModel.query()
//     .select([
//       'licences.id as licenceId',
//       'licences.licenceRef',
//       'licenceVersions.status',
//       'licenceVersionPurposePoints.abstractionMethod',
//       'points.id as pointID',
//       'points.category',
//       'points.primaryType',
//       'points.secondaryType',
//       'points.description',
//       'points.locationNote',
//       'points.depth',
//       'points.bgsReference',
//       'points.wellReference',
//       'points.hydroReference',
//       'points.hydroOffsetDistance'
//     ])
//     .joinRelated('licenceVersions')
//     .join('licenceVersionPurposes', 'licenceVersionPurposes.licenceVersionId', '=', 'licenceVersions.id')
//     .join('licenceVersionPurposePoints', 'licenceVersionPurposePoints.licenceVersionPurposeId', '=', 'licenceVersionPurposes.id')
//     .join('points', 'points.id', '=', 'licenceVersionPurposePoints.pointId')
//     .where('licences.id', licenceId)
//     .andWhere('licenceVersions.status', 'current')
//     .andWhere(
//       db.raw(`
//         EXISTS (
//           SELECT 1
//           FROM licence_versions lv2
//           WHERE lv2.licence_id = licences.id
//             AND lv2.status = 'current'
//           ORDER BY lv2.start_date DESC
//           LIMIT 1
//         )
//       `)
//     )
//     .groupBy([
//       'licences.id',
//       'licences.licenceRef',
//       'licenceVersions.status',
//       'licenceVersionPurposePoints.abstractionMethod',
//       'points.id',
//       'points.category',
//       'points.primaryType',
//       'points.secondaryType',
//       'points.description',
//       'points.locationNote',
//       'points.depth',
//       'points.bgsReference',
//       'points.wellReference',
//       'points.hydroReference',
//       'points.hydroOffsetDistance'
//     ])
//     .orderBy('points.description')
// }

// async function _fetch (licenceId) {
//   return LicenceModel.query()
//     .findById(licenceId)
//     .select([
//       'id',
//       'licenceRef'
//     ])
//     .modify('currentVersion')
//     .withGraphFetched('licenceVersions.licenceVersionPurposes')
//     .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
//       builder.select([
//         'licenceVersionPurposes.id'
//       ])
//         .orderBy('licenceVersionPurposes.createdAt', 'asc')
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints', (builder) => {
//       builder.select([
//         'licenceVersionPurposePoints.id',
//         'licenceVersionPurposePoints.abstractionMethod'
//       ])
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints.point')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints.point', (builder) => {
//       builder.select([
//         'points.category',
//         'points.primaryType',
//         'points.secondaryType',
//         'points.category',
//         'points.description',
//         'points.id',
//         'points.ngr1',
//         'points.ngr2',
//         'points.ngr3',
//         'points.ngr4',
//         'points.note',
//         'points.locationNote',
//         'points.depth',
//         'points.bgsReference',
//         'points.wellReference',
//         'points.hydroReference',
//         'points.hydroOffsetDistance',
//         'points.externalId'
//       ])
//     })
//     .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints.point.source')
//     .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposePoints.point.source', (builder) => {
//       builder.select([
//         'sources.description',
//         'sources.sourceType'
//       ])
//     })
// }

// async function _fetch (licenceId) {
//   return PointModel.query()
//     .distinct(
//       db.raw('ON (licence_version_purpose_points.abstraction_method, points.*) points.id')
//     )
//     .select([
//       'points.category',
//       'points.primaryType',
//       'points.secondaryType',
//       'points.description',
//       'points.id',
//       'points.ngr1',
//       'points.ngr2',
//       'points.ngr3',
//       'points.ngr4',
//       'points.note',
//       'points.locationNote',
//       'points.depth',
//       'points.bgsReference',
//       'points.wellReference',
//       'points.hydroReference',
//       'points.hydroOffsetDistance',
//       'points.externalId',
//       'licenceVersionPurposePoints.id AS licenceVersionPurposePointID',
//       'licenceVersionPurposes.createdAt',
//       'licenceVersionPurposes.id AS licenceVersionPurposeId',
//       'licenceVersions.status',
//       'licenceVersions.id AS licenceVersionId',
//       'licenceVersions.startDate'
//     ])
//     .joinRelated('licenceVersionPurposePoints')
//     .joinRelated('licenceVersionPurposes')
//     .join('licenceVersions', 'licenceVersionPurposes.licenceVersionId', '=', 'licenceVersions.id')
//     .join('licences', 'licenceVersions.licenceId', '=', 'licences.id')
//     .where('licences.id', licenceId)
//     .where('licenceVersions.status', 'current')
//     .whereIn('licenceVersions.id', function () {
//       this.select('id')
//         .from('licenceVersions')
//         .where('licenceId', licenceId)
//         .orderBy('startDate', 'desc')
//         .limit(1)
//     })
//     .orderBy([
//       { column: 'licence_version_purpose_points.abstraction_method', order: 'asc' },
//       { column: 'licenceVersionPurposes.createdAt', order: 'asc' }
//     ])
// }

module.exports = {
  go
}
