'use strict'

/**
 * Fetches the selected review licence instance and related data for the two-part tariff remove review licence page
 * @module FetchRemoveReviewLicenceService
 */

const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Fetches the selected review licence instance and related data for the two-part tariff remove review licence page
 *
 * @param {string} reviewLicenceId - the UUID of the selected review licence
 *
 * @returns {module:ReviewLicenceModel} the matching `ReviewLicenceModel` instance and related data needed for the
 * two-part tariff remove review licence page
 */
async function go (reviewLicenceId) {
  return _fetch(reviewLicenceId)
}

async function _fetch (reviewLicenceId) {
  return ReviewLicenceModel.query()
    .findById(reviewLicenceId)
    .select([
      'id',
      'licenceId',
      'licenceRef'
    ])
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder
        .select([
          'id',
          'billRunNumber',
          'createdAt',
          'status',
          'toFinancialYearEnding'
        ])
        .withGraphFetched('region')
        .modifyGraph('region', (builder) => {
          builder.select([
            'displayName'
          ])
        })
    })
}

module.exports = {
  go
}
