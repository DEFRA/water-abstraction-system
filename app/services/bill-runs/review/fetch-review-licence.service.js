'use strict'

/**
 * Fetches the individual review licence data for a two-part tariff bill run
 * @module FetchReviewLicenceService
 */

const { ref } = require('objection')

const ReviewLicenceModel = require('../../../models/review-licence.model.js')

async function go (reviewLicenceId) {
  return _fetch(reviewLicenceId)
}

async function _fetch (reviewLicenceId) {
  return ReviewLicenceModel.query()
    .findById(reviewLicenceId)
    .select([
      'id',
      'billRunId',
      'licenceId',
      'licenceRef',
      'licenceHolder',
      'status',
      'progress'
    ])
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder
        .select([
          'id',
          'toFinancialYearEnding'
        ])
        .withGraphFetched('region')
        .modifyGraph('region', (builder) => {
          builder.select([
            'displayName'
          ])
        })
    })
    .withGraphFetched('reviewReturns')
    .modifyGraph('reviewReturns', (builder) => {
      builder
        .select([
          'id',
          'allocated',
          'description',
          'endDate',
          'issues',
          'quantity',
          'purposes',
          'returnId',
          'returnReference',
          'returnStatus',
          'startDate',
          'underQuery'
        ])
        .orderBy('reviewReturns.startDate', 'asc')
        .withGraphFetched('returnLog')
        .modifyGraph('returnLog', (builder) => {
          builder
            .select([
              ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
              ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
              ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
              ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth')
            ])
        })
        .withGraphFetched('reviewChargeElements')
        .modifyGraph('reviewReturns', (builder) => {
          builder
            .select([
              'id'
            ])
            .orderBy('startDate', 'asc')
        })
    })
    .withGraphFetched('reviewChargeVersions')
    .modifyGraph('reviewChargeVersions', (builder) => {
      builder
        .select([
          'id',
          'chargePeriodEndDate',
          'chargePeriodStartDate'
        ])
        .orderBy('chargePeriodStartDate', 'asc')
        .withGraphFetched('reviewChargeReferences')
        .modifyGraph('reviewChargeReferences', (builder) => {
          builder
            .select([
              'id',
              'aggregate',
              'amendedAuthorisedVolume',
              'chargeAdjustment'
            ])
            .withGraphFetched('chargeReference')
            .modifyGraph('chargeReference', (builder) => {
              builder
                .select([
                  'id'
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
            .withGraphFetched('reviewChargeElements')
            .modifyGraph('reviewChargeElements', (builder) => {
              builder
                .select([
                  'reviewChargeElements.id',
                  'reviewChargeElements.amendedAllocated',
                  'reviewChargeElements.issues',
                  'reviewChargeElements.status'
                ])
                .join('chargeElements', 'reviewChargeElements.chargeElementId', 'chargeElements.id')
                .orderBy('chargeElements.authorisedAnnualQuantity', 'desc')
                .withGraphFetched('chargeElement')
                .modifyGraph('chargeElement', (builder) => {
                  builder
                    .select([
                      'id',
                      'description',
                      'abstractionPeriodStartDay',
                      'abstractionPeriodStartMonth',
                      'abstractionPeriodEndDay',
                      'abstractionPeriodEndMonth',
                      'authorisedAnnualQuantity'
                    ])
                    .withGraphFetched('purpose')
                    .modifyGraph('purpose', (builder) => {
                      builder
                        .select([
                          'id',
                          'description'
                        ])
                    })
                })
                .withGraphFetched('reviewReturns')
                .modifyGraph('reviewReturns', (builder) => {
                  builder
                    .select([
                      'reviewReturns.id',
                      'reviewReturns.quantity',
                      'reviewReturns.returnReference',
                      'reviewReturns.returnStatus'
                    ])
                })
            })
        })
        .withGraphFetched('chargeVersion')
        .modifyGraph('chargeVersion', (builder) => {
          builder
            .select([
              'id'
            ])
            .withGraphFetched('billingAccount')
            .modifyGraph('billingAccount', (builder) => {
              builder.modify('contactDetails')
            })
        })
    })
}

module.exports = {
  go
}
