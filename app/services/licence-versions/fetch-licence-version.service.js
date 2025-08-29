'use strict'

/**
 * Fetches the matching licence version and associated licence, points, purposes, and conditions data
 * @module FetchLicenceVersionService
 */

const { raw } = require('objection')

const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Fetches the matching licence version and associated licence, points, purposes, and conditions data
 *
 * @param {string} id - The UUID for the licence version to fetch
 *
 * @returns {Promise<LicenceVersionModel>} The licence version plus associated licence, points, purposes, and conditions
 */
async function go(id) {
  return _fetch(id)
}

async function _fetch(id) {
  return LicenceVersionModel.query()
    .findById(id)
    .select([
      'createdAt',
      'endDate',
      'id',
      'increment',
      'issue',
      'startDate',
      raw(
        '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
      ).as('administrative')
    ])
    .modify('history')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'licenceRef']).modify('licenceHolder')
    })
    .withGraphFetched('licenceVersionPurposes')
    .modifyGraph('licenceVersionPurposes', (licenceVersionPurposesBuilder) => {
      licenceVersionPurposesBuilder
        .select([
          'id',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'annualQuantity',
          'dailyQuantity',
          'hourlyQuantity',
          'instantQuantity'
        ])
        .orderBy('externalId', 'asc')
        .withGraphFetched('licenceVersionPurposePoints')
        .modifyGraph('licenceVersionPurposePoints', (licenceVersionPurposePointsBuilder) => {
          licenceVersionPurposePointsBuilder.select(['abstractionMethod', 'id'])
        })
        .withGraphFetched('points')
        .modifyGraph('points', (pointsBuilder) => {
          pointsBuilder
            .select(['points.description', 'points.id', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
            .withGraphFetched('source')
            .modifyGraph('source', (sourceBuilder) => {
              sourceBuilder.select(['description', 'id'])
            })
        })
        .withGraphFetched('purpose')
        .modifyGraph('purpose', (purposeBuilder) => {
          purposeBuilder.select(['description', 'id'])
        })
        .withGraphFetched('licenceVersionPurposeConditions')
        .modifyGraph('licenceVersionPurposeConditions', (licenceVersionPurposeConditionsBuilder) => {
          licenceVersionPurposeConditionsBuilder
            .select(['id'])
            .withGraphFetched('licenceVersionPurposeConditionType')
            .modifyGraph('licenceVersionPurposeConditionType', (licenceVersionPurposeConditionTypeBuilder) => {
              licenceVersionPurposeConditionTypeBuilder.select(['displayTitle', 'id'])
            })
        })
    })
}

module.exports = {
  go
}
