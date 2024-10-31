'use strict'

/**
 * Fetches the selected review charge element instance and related data for the 2PT review charge element page
 * @module FetchReviewChargeReferenceService
 */

const { ref } = require('objection')

const ReviewChargeElementModel = require('../../../models/review-charge-element.model.js')

/**
 * Fetches the match details for an individual charge element
 *
 * @param {string} reviewChargeElementId - The UUID of the review charge element being viewed
 *
 * @returns {Promise<object>} An object containing the bill run and review charge element instances
 */
async function go (reviewChargeElementId) {
  return _fetch(reviewChargeElementId)
}

async function _fetch (reviewChargeElementId) {
  return ReviewChargeElementModel.query()
    .findById(reviewChargeElementId)
    .select([
      'id',
      'amendedAllocated',
      'issues',
      'status'
    ])
    .withGraphFetched('chargeElement')
    .modifyGraph('chargeElement', (builder) => {
      builder
        .select([
          'id',
          'abstractionPeriodStartDay',
          'abstractionPeriodStartMonth',
          'abstractionPeriodEndDay',
          'abstractionPeriodEndMonth',
          'authorisedAnnualQuantity',
          'description'
        ])
    })
    .withGraphFetched('reviewChargeReference')
    .modifyGraph('reviewChargeReference', (builder) => {
      builder
        .select([
          'id',
          'amendedAuthorisedVolume'
        ])
        .withGraphFetched('reviewChargeElements')
        .modifyGraph('reviewChargeElements', (builder) => {
          builder
            .select(['id'])
        })
        .withGraphFetched('reviewChargeVersion')
        .modifyGraph('reviewChargeVersion', (builder) => {
          builder
            .select([
              'id',
              'chargePeriodStartDate',
              'chargePeriodEndDate'
            ]).withGraphFetched('reviewLicence')
            .modifyGraph('reviewLicence', (builder) => {
              builder
                .select([
                  'id',
                  'licenceId'
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
    })
    .withGraphFetched('reviewReturns')
    .modifyGraph('reviewReturns', (builder) => {
      builder
        .select([
          'reviewReturns.id',
          'reviewReturns.allocated',
          'reviewReturns.description',
          'reviewReturns.endDate',
          'reviewReturns.issues',
          'reviewReturns.quantity',
          'reviewReturns.purposes',
          'reviewReturns.returnId',
          'reviewReturns.returnReference',
          'reviewReturns.returnStatus',
          'reviewReturns.startDate',
          'reviewReturns.underQuery'
        ])
        .orderBy('reviewReturns.startDate', 'asc')
        .withGraphFetched('returnLog')
        .modifyGraph('returnLog', (builder) => {
          builder
            .select([
              'id',
              ref('metadata:nald.periodStartDay').castInt().as('periodStartDay'),
              ref('metadata:nald.periodStartMonth').castInt().as('periodStartMonth'),
              ref('metadata:nald.periodEndDay').castInt().as('periodEndDay'),
              ref('metadata:nald.periodEndMonth').castInt().as('periodEndMonth')
            ])
        })
    })
}

module.exports = {
  go
}
