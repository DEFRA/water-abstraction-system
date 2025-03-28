'use strict'

/**
 * Fetches an existing return version and its return requirements in order for a new one to be copied from it
 * @module FetchExistingRequirementsService
 */

const ReturnVersionModel = require('../../../../models/return-version.model.js')

/**
 * Fetches an existing return version and its return requirements in order for a new one to be copied from it
 *
 * In the returns setup journey we allow users to select the option to create new requirements by copying from them from
 * an existing return version. This service fetches the selected return version and its existing return requirements.
 * For each one found we'll generate a return requirement setup object in `GenerateFromExistingRequirementsService`.
 *
 * @param {string} returnVersionId - The UUID of the selected return version to copy requirements from
 *
 * @returns {Promise<module:ReturnVersionModel>} the matching return version and related return requirements
 */
async function go(returnVersionId) {
  return _fetch(returnVersionId)
}

async function _fetch(returnVersionId) {
  return ReturnVersionModel.query()
    .findById(returnVersionId)
    .select(['id', 'multipleUpload', 'startDate', 'quarterlyReturns'])
    .withGraphFetched('returnRequirements')
    .modifyGraph('returnRequirements', (returnRequirementsBuilder) => {
      returnRequirementsBuilder
        .select([
          'id',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'collectionFrequency',
          'fiftySixException',
          'gravityFill',
          'reabstraction',
          'reportingFrequency',
          'siteDescription',
          'summer',
          'twoPartTariff'
        ])
        .orderBy('siteDescription', 'asc')
        .withGraphFetched('points')
        .modifyGraph('points', (pointsBuilder) => {
          pointsBuilder.select(['points.id', 'points.description'])
        })
        .withGraphFetched('returnRequirementPurposes')
        .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
          returnRequirementPurposesBuilder
            .select(['id', 'alias', 'purposeId'])
            .withGraphFetched('purpose')
            .modifyGraph('purpose', (purposeBuilder) => {
              purposeBuilder.select(['id', 'description'])
            })
        })
    })
}

module.exports = {
  go
}
