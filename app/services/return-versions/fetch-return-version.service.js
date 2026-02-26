'use strict'

/**
 * Fetches the matching return version and associated licence, return requirements, points and purposes data
 * @module FetchReturnVersionService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches the matching return version and associated licence, return requirements, points and purposes data
 *
 * @param {string} returnVersionId - The UUID of the return version to fetch
 *
 * @returns {Promise<ReturnVersionModel>} The return version plus linked licence, return requirements (requirement,
 * points, purposes)
 */
async function go(returnVersionId) {
  return {
    returnVersion: await _fetch(returnVersionId),
    returnVersionsForPagination: await _fetchPagination(returnVersionId)
  }
}

async function _fetch(returnVersionId) {
  return ReturnVersionModel.query()
    .findById(returnVersionId)
    .select(['createdAt', 'id', 'multipleUpload', 'notes', 'reason', 'quarterlyReturns', 'startDate', 'status'])
    .modify('history')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'licenceRef']).modify('licenceHolder')
    })
    .withGraphFetched('returnRequirements')
    .modifyGraph('returnRequirements', (returnRequirementsBuilder) => {
      returnRequirementsBuilder
        .select([
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'collectionFrequency',
          'fiftySixException',
          'gravityFill',
          'id',
          'legacyId',
          'reabstraction',
          'reportingFrequency',
          'siteDescription',
          'summer',
          'twoPartTariff'
        ])
        .orderBy('legacyId', 'asc')
        .withGraphFetched('points')
        .modifyGraph('points', (pointsBuilder) => {
          pointsBuilder.select([
            'points.description',
            'points.id',
            'points.ngr1',
            'points.ngr2',
            'points.ngr3',
            'points.ngr4'
          ])
        })
        .withGraphFetched('returnRequirementPurposes')
        .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
          returnRequirementPurposesBuilder
            .select(['alias', 'id'])
            .withGraphFetched('purpose')
            .modifyGraph('purpose', (builder) => {
              builder.select(['description', 'id'])
            })
        })
    })
}

async function _fetchPagination(returnVersionId) {
  return ReturnVersionModel.query()
    .where('licenceId', ReturnVersionModel.query().select('licenceId').findById(returnVersionId))
    .select(['id', 'startDate'])
    .orderBy([
      { column: 'startDate', order: 'asc' },
      { column: 'endDate', order: 'asc' }
    ])
}

module.exports = {
  go
}
