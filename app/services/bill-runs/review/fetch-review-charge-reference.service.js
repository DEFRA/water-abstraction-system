'use strict'

/**
 * Fetches the selected review charge reference instance and related data for the 2PT review charge reference page
 * @module FetchReviewChargeReferenceService
 */

const { ref } = require('objection')

const ReviewChargeReferenceModel = require('../../../models/review-charge-reference.model.js')

/**
 * Fetches the selected review charge reference instance and related data for the 2PT review charge reference page
 *
 * @param {string} reviewChargeReferenceId - the UUID of the selected review charge reference
 *
 * @returns {module:ReviewChargeReferenceModel} the matching `ReviewChargeReferenceModel` instance and related data
 * needed for the two-part tariff review charge reference page
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
    .modifyGraph('reviewChargeVersion', (builder) => {
      builder
        .select([
          'id',
          'chargePeriodStartDate',
          'chargePeriodEndDate'
        ])
        .withGraphFetched('reviewLicence')
        .modifyGraph('reviewLicence', (builder) => {
          builder
            .select([
              'id'
            ])
            .withGraphFetched('billRun')
            .modifyGraph('billRun', (builder) => {
              builder
                .select([
                  'id',
                  'toFinancialYearEnding'
                ])
            })
        })
    })
    .withGraphFetched('reviewChargeElements')
    .modifyGraph('reviewChargeElements', (builder) => {
      builder
        .select([
          'id',
          'amendedAllocated'
        ])
    })
    .withGraphFetched('chargeReference')
    .modifyGraph('chargeReference', (builder) => {
      builder
        .select([
          'id',
          'volume',
          'chargeCategoryId',
          ref('chargeReferences.additionalCharges:supportedSource.name').castText().as('supportedSourceName'),
          ref('chargeReferences.additionalCharges:isSupplyPublicWater').castText().as('waterCompanyCharge')
        ])
        .withGraphFetched('chargeCategory')
        .modifyGraph('chargeCategory', (builder) => {
          builder
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