'use strict'

/**
 * Fetches the selected review charge reference instance and related data for the 2PT review charge reference pages
 * @module FetchReviewChargeReferenceService
 */

const { ref } = require('objection')

const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Fetches the selected review charge reference instance and related data for the 2PT review charge reference pages
 *
 * This fetch service fetches the data needed for the main review charge reference page, but also the authorised,
 * factors and preview charge pages/services.
 *
 * @param {string} reviewChargeReferenceId - the UUID of the selected review charge reference
 *
 * @returns {module:ReviewChargeReferenceModel} the matching `ReviewChargeReferenceModel` instance and related data
 * needed for the two-part tariff review charge reference page and sub-pages
 */
async function go (reviewChargeReferenceId) {
  return _fetch(reviewChargeReferenceId)
}

async function _fetch (reviewChargeReferenceId) {
  return ReviewChargeReferenceModel.query()
    .findById(reviewChargeReferenceId)
    .select([
      'id',
      'abatementAgreement',
      'aggregate',
      'amendedAggregate',
      'amendedAuthorisedVolume',
      'amendedChargeAdjustment',
      'canalAndRiverTrustAgreement',
      'chargeAdjustment',
      'twoPartTariffAgreement',
      'winterDiscount'
    ])
    .withGraphFetched('reviewChargeVersion')
    .modifyGraph('reviewChargeVersion', (reviewChargeVersionBuilder) => {
      reviewChargeVersionBuilder
        .select([
          'id',
          'chargePeriodStartDate',
          'chargePeriodEndDate'
        ])
        .withGraphFetched('reviewLicence')
        .modifyGraph('reviewLicence', (reviewLicenceBuilder) => {
          reviewLicenceBuilder
            .select([
              'id'
            ])
            .withGraphFetched('billRun')
            .modifyGraph('billRun', (billRunBuilder) => {
              billRunBuilder
                .select([
                  'id',
                  'toFinancialYearEnding'
                ])
            })
            .withGraphFetched('licence')
            .modifyGraph('licence', (licenceBuilder) => {
              licenceBuilder
                .select([
                  'id',
                  'waterUndertaker'
                ])
            })
        })
    })
    .withGraphFetched('reviewChargeElements')
    .modifyGraph('reviewChargeElements', (reviewChargeElementsBuilder) => {
      reviewChargeElementsBuilder
        .select([
          'id',
          'amendedAllocated'
        ])
    })
    .withGraphFetched('chargeReference')
    .modifyGraph('chargeReference', (chargeReferenceBuilder) => {
      chargeReferenceBuilder
        .select([
          'id',
          'volume',
          'loss',
          ref('chargeReferences.additionalCharges:supportedSource.name').castText().as('supportedSourceName'),
          ref('chargeReferences.additionalCharges:isSupplyPublicWater').castText().as('waterCompanyCharge')
        ])
        .withGraphFetched('chargeCategory')
        .modifyGraph('chargeCategory', (chargeCategoryBuilder) => {
          chargeCategoryBuilder
            .select([
              'id',
              'reference',
              'shortDescription'
            ])
        })
    })
}

module.exports = {
  go
}
