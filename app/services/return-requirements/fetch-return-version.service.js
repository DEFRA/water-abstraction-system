'use strict'

/**
 * Fetches requirements for returns by the return version id
 * @module FetchRequirementsForReturnsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches requirements for returns by the return version id
 *
 * Includes the licence, return requirements (requirement, points, purposes)
 *
 * @param {string} returnVersionId - The UUID of the selected return version to get requirements for
 *
 * @returns {Promise<ReturnVersionModel>} The return version plus linked licence, return requirements (requirement,
 * points, purposes)
 */
async function go (returnVersionId) {
  return _fetch(returnVersionId)
}

async function _fetch (returnVersionId) {
  return ReturnVersionModel.query()
    .findById(returnVersionId)
    .select([
      'createdAt',
      'id',
      'multipleUpload',
      'notes',
      'reason',
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
    .withGraphFetched('returnRequirements.returnRequirementPoints')
    .modifyGraph('returnRequirements.returnRequirementPoints', (builder) => {
      builder.select([
        'description',
        'id',
        'ngr1',
        'ngr2',
        'ngr3',
        'ngr4'
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
