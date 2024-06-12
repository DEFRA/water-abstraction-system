'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const { twoPartTariffReviewIssues } = require('../../../lib/static-lookups.lib.js')

const DatabaseConfig = require('../../../../config/database.config.js')

/**
 * Takes the bill run ID and fetches all the data needed to review the bill run
 *
 * Fetches specifically the bill run data, a list of the licences in the bill run with the licence holder and licence
 * ref.
 *
 * @param {String} id The UUID for the bill run
 * @param {{Object[]}} filterIssues An array of issues to filter the results by. This will only contain data when
 * there is a POST request, which only occurs when a filter is applied to the results. NOTE: if there is only a single
 * issue this will be a string, not an array
 * @param {String} filterLicenceHolderNumber The licence holder or licence number to filter the results by. This will
 * only contain data when there is a POST request, which only occurs when a filter is applied to the results.
 * @param {String} filterLicenceStatus The status of the licence to filter the results by. This also only contains data
 * when there is a POST request.
 * @param {number} page - the page number of licences to be viewed
 *
 * @returns {Promise<Object>} An object containing the billRun data and an array of licences for the bill run that match
 * the selected 'page in the data. Also included is any data that has been used to filter the results
 */
async function go (id, filterIssues, filterLicenceHolderNumber, filterLicenceStatus, page) {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchBillRunLicences(id, filterIssues, filterLicenceHolderNumber, filterLicenceStatus, page)

  return { billRun, licences }
}

function _applyFilters (reviewLicenceQuery, filterIssues, filterLicenceHolderNumber, filterLicenceStatus) {
  if (filterIssues) {
    _filterIssues(filterIssues, reviewLicenceQuery)
  }

  if (filterLicenceHolderNumber) {
    reviewLicenceQuery.where((builder) => {
      builder
        .whereILike('licenceHolder', `%${filterLicenceHolderNumber}%`)
        .orWhereILike('licenceRef', `%${filterLicenceHolderNumber}%`)
    })
  }

  if (filterLicenceStatus) {
    reviewLicenceQuery.where('status', filterLicenceStatus)
  }
}

async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select('id', 'createdAt', 'status', 'toFinancialYearEnding', 'batchType')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select('id', 'displayName')
    })
    .withGraphFetched('reviewLicences')
    .modifyGraph('reviewLicences', (builder) => {
      builder.count('licenceId as totalNumberOfLicences')
        .count({ numberOfLicencesToReview: ReviewLicenceModel.raw("CASE WHEN status = 'review' THEN 1 END") })
        .groupBy('billRunId')
    })
}

async function _fetchBillRunLicences (id, filterIssues, filterLicenceHolderNumber, filterLicenceStatus, page = 1) {
  const reviewLicenceQuery = ReviewLicenceModel.query()
    .select('licenceId', 'licenceRef', 'licenceHolder', 'issues', 'progress', 'status')
    .where('billRunId', id)
    .orderBy([
      { column: 'status', order: 'desc' },
      { column: 'licenceRef', order: 'asc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)

  _applyFilters(reviewLicenceQuery, filterIssues, filterLicenceHolderNumber, filterLicenceStatus)

  return reviewLicenceQuery
}

function _filterIssues (filterIssues, reviewLicenceQuery) {
  // if only a single issue is checked in the filter then a string is returned, otherwise it is an array
  if (typeof filterIssues === 'string') {
    const lookupIssue = twoPartTariffReviewIssues[filterIssues]
    reviewLicenceQuery.whereLike('issues', `%${lookupIssue}%`)
  } else {
    // if we have got here then `issues` must be an array containing at least 2 records
    const lookupIssues = filterIssues.map((filterIssue) => {
      return twoPartTariffReviewIssues[filterIssue]
    })

    // the number of issues to check for in the where clause will vary depending on the number of issues checked. But
    // there will always be at least 2
    reviewLicenceQuery.where((builder) => {
      builder
        .whereLike('issues', `%${lookupIssues[0]}%`)
      for (let i = 1; i < lookupIssues.length; i++) {
        builder.orWhereLike('issues', `%${lookupIssues[i]}%`)
      }
    })
  }
}

module.exports = {
  go
}
