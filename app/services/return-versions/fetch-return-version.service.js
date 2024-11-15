'use strict'

/**
 * Fetches the matching return version and associated licence, return requirements, points and purposes data
 * @module FetchReturnVersionService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches the matching return version and associated licence, return requirements, points and purposes data
 *
 * @param {string} id - The UUID for the bill run to fetch
 *
 * @returns {Promise<ReturnVersionModel>} The return version plus linked licence, return requirements (requirement,
 * points, purposes)
 */
async function go (id) {
  return _fetch(id)
}

async function _fetch (id) {
  return ReturnVersionModel.query()
    .findById(id)
    .select([
      'createdAt',
      'id',
      'multipleUpload',
      'notes',
      'reason',
      'quarterlyReturns',
      'startDate',
      'status'
    ])
    .modify('history')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'licenceRef'
      ]).modify('licenceHolder')
    })
    .withGraphFetched('returnRequirements')
    .modifyGraph('returnRequirements', (builder) => {
      builder.select([
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
    })
    .withGraphFetched('returnRequirements.points')
    .modifyGraph('returnRequirements.points', (builder) => {
      builder.select([
        'points.description',
        'points.id',
        'points.ngr1',
        'points.ngr2',
        'points.ngr3',
        'points.ngr4'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPurposes')
    .modifyGraph('returnRequirements.returnRequirementPurposes', (builder) => {
      builder.select([
        'alias',
        'id'
      ])
    })
    .withGraphFetched('returnRequirements.returnRequirementPurposes.purpose')
    .modifyGraph('returnRequirements.returnRequirementPurposes.purpose', (builder) => {
      builder.select([
        'description',
        'id'
      ])
    })
}

module.exports = {
  go
}
