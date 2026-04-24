'use strict'

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 * @module FetchLicenceReturnRequirementsService
 */

const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 *
 * ### withGraphJoined vs withGraphFetched
 *
 * > _The main difference is that `withGraphFetched` uses multiple queries under the hood to fetch the result while_
 * > _`withGraphJoined` uses a single query and joins to fetch the results._
 * >
 * > {@link https://vincit.github.io/objection.js/api/query-builder/eager-methods.html#withgraphfetched|Objection docs}
 *
 * **Objection.js** recommends you stick with `withGraphFetched`, because though `withGraphJoined` may sound more
 * performant, it is often not the case.
 *
 * This is why it is used in almost all our Objection queries. We have had to switch to `withGraphJoined` here because
 * you cannot use `withGraphFetched` inside a transaction.
 *
 * The underlying PostgreSQL package has deprecated calling `client.query()` when the client is already executing a
 * query. Because Objection is firing multiple queries inside a `Promise.all()` when we use `withGraphFetched`, it
 * raises this warning. Using `withGraphJoined` results in a single query, which means we're not making concurrent
 * requests to the DB.
 *
 * Fortunately, Objection.js also jumps in and hydrates the results into the same tree structure we would get
 * if we used `withGraphFetched`, from the flat SQL results. The one bit it can't do is carry forward raw computed
 * columns in nested modifyGraph selects, which is why we have to do the manual copying of `historicalAreaCode` to
 * `areacode` in the returned results (see note below).
 *
 * @param {string} licenceId - the UUID of the licence that the return requirements are linked to
 * @param {Date} changeDate - the date where the change occurs from and from which we need to reissue return logs from
 * @param {object} [trx=null] - Optional transaction object
 *
 * @returns {Promise<module:ReturnRequirementModel[]>} the matching return requirements for the licence and change date
 */
async function go(licenceId, changeDate, trx = null) {
  return _fetch(licenceId, changeDate, trx)
}

async function _fetch(licenceId, changeDate, trx) {
  const returnRequirements = await ReturnRequirementModel.query(trx)
    .select([
      'returnRequirements.abstractionPeriodEndDay',
      'returnRequirements.abstractionPeriodEndMonth',
      'returnRequirements.abstractionPeriodStartDay',
      'returnRequirements.abstractionPeriodStartMonth',
      'returnRequirements.externalId',
      'returnRequirements.id',
      'returnRequirements.reference',
      'returnRequirements.reportingFrequency',
      'returnRequirements.returnVersionId',
      'returnRequirements.siteDescription',
      'returnRequirements.summer',
      'returnRequirements.twoPartTariff'
    ])
    .whereExists(
      ReturnVersionModel.query()
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
    .withGraphJoined(
      '[returnVersion.[licence.region], points, returnRequirementPurposes.[primaryPurpose, purpose, secondaryPurpose]]'
    )
    .modifyGraph('returnVersion', (returnVersionBuilder) => {
      returnVersionBuilder.select([
        'endDate',
        'returnVersions.id',
        'reason',
        'startDate',
        'quarterlyReturns',
        'multipleUpload'
      ])
    })
    .modifyGraph('returnVersion.licence', (licenceBuilder) => {
      licenceBuilder.select(['expiredDate', 'licences.id', 'lapsedDate', 'licenceRef', 'regions', 'revokedDate'])
    })
    .modifyGraph('returnVersion.licence.region', (regionBuilder) => {
      regionBuilder.select(['regions.id', 'naldRegionId'])
    })
    .modifyGraph('points', (pointsBuilder) => {
      pointsBuilder.select(['points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    })
    .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
      returnRequirementPurposesBuilder.select(['alias', 'returnRequirementPurposes.id'])
    })
    .modifyGraph('returnRequirementPurposes.primaryPurpose', (primaryPurposeBuilder) => {
      primaryPurposeBuilder.select(['description', 'id', 'legacyId'])
    })
    .modifyGraph('returnRequirementPurposes.purpose', (purposeBuilder) => {
      purposeBuilder.select(['description', 'id', 'legacyId'])
    })
    .modifyGraph('returnRequirementPurposes.secondaryPurpose', (secondaryPurposeBuilder) => {
      secondaryPurposeBuilder.select(['description', 'id', 'legacyId'])
    })

  // NOTE: Normally, we would have used `db.raw("regions->>'historicalAreaCode' as areacode")` in the licence part of
  // the query in order to make areacode more easily accessible to the calling module. However, `db.raw()` in the select
  // does not work when using `withGraphJoined`. This is because it builds nested objects from one flattened joined
  // result set using relation-path aliases. Internally, Objection only carries forward columns it can safely map
  // through its relation join/alias pipeline. Raw computed columns in nested modifyGraph selects are not reliably
  // tracked through that pipeline, so they can be dropped before final hydration, even though the SQL itself is valid
  // and does not error.
  //
  // Therefore, to normalise the data into the format expected by our calling services, we loop through the results,
  // copy `historicalAreaCode` to `areacode` and delete then the `regions` object.
  returnRequirements.forEach((returnRequirement) => {
    const licence = returnRequirement.returnVersion.licence

    licence.areacode = licence.regions.historicalAreaCode
    delete licence.regions
  })

  return returnRequirements
}

module.exports = {
  go
}
