'use strict'

/**
 * Fetches data needed for the view `/licence-versions/{id}` page
 * @module FetchLicenceVersionService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')
const { raw } = require('objection')

/**
 * Fetches data needed for the view `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID for the licence version to fetch
 *
 * @returns {Promise<object>} an object with the licence version and the licence versions for pagination
 */
async function go(licenceVersionId) {
  return {
    licenceVersion: await _fetch(licenceVersionId),
    licenceVersionsForPagination: await _fetchPagination(licenceVersionId)
  }
}

async function _fetchPagination(licenceVersionId) {
  return LicenceVersionModel.query()
    .where('licenceId', LicenceVersionModel.query().select('licenceId').findById(licenceVersionId))
    .select(['id', 'startDate'])
    .orderBy([
      { column: 'startDate', order: 'asc' },
      { column: 'endDate', order: 'asc' }
    ])
}

async function _fetch(licenceVersionId) {
  return LicenceVersionModel.query()
    .findById(licenceVersionId)
    .select([
      'application_number',
      'id',
      'issue_date',
      'startDate',
      'endDate',
      raw(
        '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
      ).as('administrative')
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
    .withGraphFetched('licenceVersionHolder')
    .modifyGraph('licenceVersionHolder', (licenceVersionHolderBuilder) => {
      licenceVersionHolderBuilder.select([
        'id',
        'addressLine1',
        'addressLine2',
        'addressLine3',
        'addressLine4',
        'country',
        'county',
        'forename',
        'holderType',
        'initials',
        'name',
        'postcode',
        'salutation',
        'town'
      ])
    })
    .modify('history')
    .withGraphFetched('licenceVersionPurposes')
    .modifyGraph('licenceVersionPurposes', (builder) => {
      builder
        .select([
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'annualQuantity',
          'dailyQuantity',
          'hourlyQuantity',
          'instantQuantity'
        ])
        .orderBy('licenceVersionPurposes.createdAt', 'asc')
        .withGraphFetched('licenceVersionPurposePoints')
        .modifyGraph('licenceVersionPurposePoints', (licenceVersionPurposePointsBuilder) => {
          licenceVersionPurposePointsBuilder.select(['licenceVersionPurposePoints.abstractionMethod'])
        })
        .withGraphFetched('points')
        .modifyGraph('points', (pointsBuilder) => {
          pointsBuilder
            .select([
              'points.id',
              'points.bgsReference',
              'points.category',
              'points.depth',
              'points.description',
              'points.hydroInterceptDistance',
              'points.hydroReference',
              'points.hydroOffsetDistance',
              'points.locationNote',
              'points.ngr1',
              'points.ngr2',
              'points.ngr3',
              'points.ngr4',
              'points.note',
              'points.primaryType',
              'points.secondaryType',
              'points.wellReference'
            ])
            .orderBy([{ column: 'points.externalId', order: 'asc' }])
            .withGraphFetched('source')
            .modifyGraph('source', (sourceBuilder) => {
              sourceBuilder.select(['sources.description', 'sources.id', 'sources.sourceType'])
            })
        })
        .withGraphFetched('purpose')
        .modifyGraph('purpose', (purposeBuilder) => {
          purposeBuilder.select(['id', 'description'])
        })
    })
}

module.exports = {
  go
}
