'use strict'

/**
 * Fetches a licence version's points needed for `/return-versions/setup/{sessionId}/points` page
 * @module FetchPointsService
 */

const PointModel = require('../../../models/point.model.js')

/**
 * Fetches a licence version's points needed for `/return-versions/setup/{sessionId}/points` page
 *
 * @param {string} licenceVersionId - The UUID for the relevant licence version to fetch purposes from
 *
 * @returns {Promise<module:PointModel[]>} The distinct points for the matching licence version
 */
async function go(licenceVersionId) {
  return PointModel.query()
    .distinct(['points.id', 'points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    .innerJoin('licenceVersionPurposePoints', 'licenceVersionPurposePoints.pointId', 'points.id')
    .innerJoin(
      'licenceVersionPurposes',
      'licenceVersionPurposes.id',
      'licenceVersionPurposePoints.licenceVersionPurposeId'
    )
    .innerJoin('licenceVersions', 'licenceVersions.id', 'licenceVersionPurposes.licenceVersionId')
    .where('licenceVersions.id', licenceVersionId)
}

module.exports = {
  go
}
