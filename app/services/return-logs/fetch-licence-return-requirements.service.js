'use strict'

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 * @module FetchLicenceReturnRequirementsService
 */

const { db } = require('../../../db/db.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 *
 * @param {string} licenceId - the UUID of the licence that the return requirements are linked to
 * @param {Date} changeDate - the date where the change occurs from and from which we need to reissue return logs from
 *
 * @returns {Promise<module:ReturnRequirementModel[]>} the matching return requirements for the licence and change date
 */
async function go(licenceId, changeDate) {
  return _fetch(licenceId, changeDate)
}

async function _fetch(licenceId, changeDate) {
  return ReturnRequirementModel.query()
    .select([
      'abstractionPeriodEndDay',
      'abstractionPeriodEndMonth',
      'abstractionPeriodStartDay',
      'abstractionPeriodStartMonth',
      'externalId',
      'id',
      'legacyId',
      'reportingFrequency',
      'returnVersionId',
      'siteDescription',
      'summer',
      'twoPartTariff',
      'upload'
    ])
    .whereExists(
      ReturnVersionModel.query()
        .select(1)
        .innerJoinRelated('licence')
        .where('licence.id', licenceId)
        .where('returnVersions.status', 'current')
        .where((builder) => {
          builder.whereNull('returnVersions.endDate').orWhere('returnVersions.endDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.expiredDate').orWhere('licence.expiredDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.lapsedDate').orWhere('licence.lapsedDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.revokedDate').orWhere('licence.revokedDate', '>=', changeDate)
        })
        .whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')
    )
    .withGraphFetched('returnVersion')
    .modifyGraph('returnVersion', (returnVersionBuilder) => {
      returnVersionBuilder
        .select(['endDate', 'id', 'reason', 'startDate'])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder
            .select([
              'expiredDate',
              'id',
              'lapsedDate',
              'licenceRef',
              'revokedDate',
              db.raw("regions->>'historicalAreaCode' as areacode")
            ])
            .withGraphFetched('region')
            .modifyGraph('region', (regionBuilder) => {
              regionBuilder.select(['id', 'naldRegionId'])
            })
        })
    })
    .withGraphFetched('points')
    .modifyGraph('points', (pointsBuilder) => {
      pointsBuilder.select(['points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    })
    .withGraphFetched('returnRequirementPurposes')
    .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
      returnRequirementPurposesBuilder
        .select(['alias', 'id'])
        .withGraphFetched('primaryPurpose')
        .modifyGraph('primaryPurpose', (primaryPurposeBuilder) => {
          primaryPurposeBuilder.select(['description', 'id', 'legacyId'])
        })
        .withGraphFetched('purpose')
        .modifyGraph('purpose', (purposeBuilder) => {
          purposeBuilder.select(['description', 'id', 'legacyId'])
        })
        .withGraphFetched('secondaryPurpose')
        .modifyGraph('secondaryPurpose', (secondaryPurposeBuilder) => {
          secondaryPurposeBuilder.select(['description', 'id', 'legacyId'])
        })
    })
}

module.exports = {
  go
}
