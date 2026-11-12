/**
 * Fetches the selected review licence instance and related data for the two-part tariff review licence page
 * @module FetchReviewLicenceDal
 */

import ReviewLicenceModel from 'water-abstraction-engine/models/review-licence.model.js'

/**
 * Fetches the selected review licence instance and related data for the two-part tariff review licence page
 *
 * @param {string} reviewLicenceId - the UUID of the selected review licence
 *
 * @returns {module:ReviewLicenceModel} the matching `ReviewLicenceModel` instance and related data needed for the
 * two-part tariff review licence page
 */
export default async function fetchReviewLicenceDal(reviewLicenceId) {
  return ReviewLicenceModel.query()
    .findById(reviewLicenceId)
    .select(['id', 'billRunId', 'licenceId', 'licenceRef', 'licenceHolder', 'status', 'progress'])
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (billRunBuilder) => {
      billRunBuilder
        .select(['id', 'batchType', 'scheme', 'summer', 'toFinancialYearEnding'])
        .withGraphFetched('region')
        .modifyGraph('region', (regionBuilder) => {
          regionBuilder.select(['id', 'displayName'])
        })
    })
    .withGraphFetched('reviewReturns')
    .modifyGraph('reviewReturns', (reviewReturnsBuilder) => {
      reviewReturnsBuilder
        .select([
          'id',
          'allocated',
          'description',
          'endDate',
          'issues',
          'quantity',
          'purposes',
          'returnId',
          'returnLogId',
          'returnReference',
          'returnStatus',
          'startDate',
          'underQuery'
        ])
        .orderBy('reviewReturns.startDate', 'asc')
        .withGraphFetched('returnLog')
        .modifyGraph('returnLog', (returnLogBuilder) => {
          returnLogBuilder
            .select([
              'returnLogs.id',
              'returnLogs.returnId',
              'returnRequirement.abstractionPeriodStartDay AS periodStartDay',
              'returnRequirement.abstractionPeriodStartMonth AS periodStartMonth',
              'returnRequirement.abstractionPeriodEndDay AS periodEndDay',
              'returnRequirement.abstractionPeriodEndMonth AS periodEndMonth'
            ])
            .innerJoinRelated('returnRequirement')
        })
        .withGraphFetched('reviewChargeElements')
        .modifyGraph('reviewChargeElements', (reviewChargeElementsBuilder) => {
          reviewChargeElementsBuilder.select(['reviewChargeElements.id'])
        })
    })
    .withGraphFetched('reviewChargeVersions')
    .modifyGraph('reviewChargeVersions', (reviewChargeVersions) => {
      reviewChargeVersions
        .select(['id', 'chargePeriodEndDate', 'chargePeriodStartDate'])
        .orderBy('chargePeriodStartDate', 'asc')
        .withGraphFetched('reviewChargeReferences')
        .modifyGraph('reviewChargeReferences', (reviewChargeReferencesBuilder) => {
          reviewChargeReferencesBuilder
            .select(['id', 'aggregate', 'amendedAuthorisedVolume', 'chargeAdjustment'])
            .withGraphFetched('chargeReference')
            .modifyGraph('chargeReference', (chargeReferenceBuilder) => {
              chargeReferenceBuilder
                .select(['id'])
                .withGraphFetched('chargeCategory')
                .modifyGraph('chargeCategory', (chargeCategoryBuilder) => {
                  chargeCategoryBuilder.select(['id', 'reference', 'shortDescription'])
                })
            })
            .withGraphFetched('reviewChargeElements')
            .modifyGraph('reviewChargeElements', (reviewChargeElementsBuilder) => {
              reviewChargeElementsBuilder
                .select([
                  'reviewChargeElements.id',
                  'reviewChargeElements.amendedAllocated',
                  'reviewChargeElements.issues',
                  'reviewChargeElements.status'
                ])
                .join('chargeElements', 'reviewChargeElements.chargeElementId', 'chargeElements.id')
                .orderBy('chargeElements.authorisedAnnualQuantity', 'desc')
                .withGraphFetched('chargeElement')
                .modifyGraph('chargeElement', (chargeElementBuilder) => {
                  chargeElementBuilder
                    .select([
                      'id',
                      'abstractionPeriodStartDay',
                      'abstractionPeriodStartMonth',
                      'abstractionPeriodEndDay',
                      'abstractionPeriodEndMonth',
                      'authorisedAnnualQuantity',
                      'description'
                    ])
                    .withGraphFetched('purpose')
                    .modifyGraph('purpose', (purposeBuilder) => {
                      purposeBuilder.select(['id', 'description'])
                    })
                })
                .withGraphFetched('reviewReturns')
                .modifyGraph('reviewReturns', (reviewReturnsBuilder) => {
                  reviewReturnsBuilder.select([
                    'reviewReturns.id',
                    'reviewReturns.quantity',
                    'reviewReturns.returnReference',
                    'reviewReturns.returnStatus'
                  ])
                })
            })
        })
        .withGraphFetched('chargeVersion')
        .modifyGraph('chargeVersion', (chargeVersionBuilder) => {
          chargeVersionBuilder
            .select(['id'])
            .withGraphFetched('billingAccount')
            .modifyGraph('billingAccount', (billingAccountBuilder) => {
              billingAccountBuilder.modify('contactDetails')
            })
        })
    })
}
