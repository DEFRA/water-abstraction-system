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
 * @returns {Promise<ReturnVersionModel[]>}
 * The return version, licence, return requirements (requirement, points, purposes)
 *
 */
async function go (returnVersionId) {
  const returnVersion = await _fetch(returnVersionId)

  return returnVersion
}

async function _fetch (returnVersionId) {
  return ReturnVersionModel.query()
    .findById(returnVersionId)
    .select([
      'id',
      'multiple_upload',
      'notes',
      'reason',
      'startDate',
      'status'
    ])
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
    .withGraphFetched('returnRequirements.[returnRequirementPoints as points]')
    .modifyGraph('returnRequirements.[returnRequirementPoints as points]', (builder) => {
      builder.select([
        'description',
        'ngr1',
        'ngr2',
        'ngr3',
        'ngr4'
      ])
    })
    .withGraphFetched('returnRequirements.[returnRequirementPurposes as purposes.[purpose as purposeDetails]]')
    .modifyGraph('returnRequirements.[returnRequirementPurposes as purposes]', (builder) => {
      builder.select(['id'])
    })
    .modifyGraph('returnRequirements.[returnRequirementPurposes as purposes.[purpose as purposeDetails]]', (builder) => {
      builder.select(['description'])
    })
}

module.exports = {
  go
}
