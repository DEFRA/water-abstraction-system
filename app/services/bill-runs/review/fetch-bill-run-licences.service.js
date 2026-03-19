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
 * Fetches bill run and licences data for two-part-tariff billing review
 *
 * Specifically, the bill run data and a list of the licences in the bill run with their licence holder and licence ref.
 *
 * The licences can be filtered on the the review page to allow users to process them. The filters are
 *
 * - **issues** - An array of issues or `['noIssues`]`, which means return only those without an issue
 * - **licenceHolderNumber** - The licence holder or licence number, or part there of
 * - **licenceStatus** - The status of the licence; 'Review' or 'Ready'
 * - **progress** - An array, though it will either be empty or contain 'inProgress'. If it contains 'inProgress' only
 * return those licences marked as 'in progress'.
 *
 * @param {string} id - The UUID for the bill run
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} An object containing the billRun data and an array of licences for the bill run that match
 * the selected page in the data. Also included is any data that has been used to filter the results
 */
async function go(id, filters, page = '1') {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchBillRunLicences(id, filters, page)

  return { billRun, licences }
}

function _applyFilters(reviewLicenceQuery, filters) {
  const { issues, licenceHolderNumber, licenceStatus, progress } = filters

  if (issues.length > 0) {
    _filterIssues(issues, reviewLicenceQuery)
  }

  if (licenceHolderNumber) {
    reviewLicenceQuery.where((builder) => {
      builder
        .whereILike('licenceHolder', `%${licenceHolderNumber}%`)
        .orWhereILike('licenceRef', `%${licenceHolderNumber}%`)
    })
  }

  if (licenceStatus) {
    reviewLicenceQuery.where('status', licenceStatus)
  }

  if (progress.includes('inProgress')) {
    reviewLicenceQuery.where('progress', 'true')
  }
}

async function _fetchBillRun(id) {
  return BillRunModel.query()
    .findById(id)
    .select('id', 'batchType', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select('id', 'displayName')
    })
    .withGraphFetched('reviewLicences')
    .modifyGraph('reviewLicences', (builder) => {
      builder
        .count('licenceId as totalNumberOfLicences')
        .count({ numberOfLicencesToReview: ReviewLicenceModel.raw("CASE WHEN status = 'review' THEN 1 END") })
        .groupBy('billRunId')
    })
}

async function _fetchBillRunLicences(id, filters, page) {
  const reviewLicenceQuery = ReviewLicenceModel.query()
    .select('id', 'licenceId', 'licenceRef', 'licenceHolder', 'issues', 'progress', 'status')
    .where('billRunId', id)

  _applyFilters(reviewLicenceQuery, filters)

  reviewLicenceQuery
    .orderBy([
      { column: 'status', order: 'desc' },
      { column: 'licenceRef', order: 'asc' }
    ])
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)

  return reviewLicenceQuery
}

function _filterIssues(issues, reviewLicenceQuery) {
  if (issues.includes('no-issues')) {
    // To search for no issues, check if the issues column is empty
    reviewLicenceQuery.where('issues', '')

    return
  }

  const lookupIssues = issues.map((filterIssue) => {
    return twoPartTariffReviewIssues[filterIssue]
  })

  // Construct a query that checks for multiple issues. There will always be at least two issues to check for.
  reviewLicenceQuery.where((builder) => {
    builder.whereLike('issues', `%${lookupIssues[0]}%`)
    for (let i = 1; i < lookupIssues.length; i++) {
      builder.orWhereLike('issues', `%${lookupIssues[i]}%`)
    }
  })
}

module.exports = {
  go
}
