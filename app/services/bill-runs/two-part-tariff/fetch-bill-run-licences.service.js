'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')
const { twoPartTariffReviewIssues } = require('../../../lib/static-lookups.lib.js')

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
 * @param {String} filterLicenceHolder The licence holder to filter the results by. This will only contain data when
 * there is a POST request, which only occurs when a filter is applied to the results.
 * @param {String} filterLicenceStatus The status of the licence to filter the results by. This also only contains data
 * when there is a POST request.
 *
 * @returns {Promise<Object>} An object containing the billRun data and an array of licences for the bill run. Also
 * included is any data that has been used to filter the results
 */
async function go (id, filterIssues, filterLicenceHolder, filterLicenceStatus) {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchBillRunLicences(id, filterIssues, filterLicenceHolder, filterLicenceStatus)

  return { billRun, licences }
}

function _applyFilters (reviewLicenceQuery, filterIssues, filterLicenceHolder, filterLicenceStatus) {
  if (filterIssues) {
    _filterIssues(filterIssues, reviewLicenceQuery)
  }

  if (filterLicenceHolder) {
    reviewLicenceQuery.whereILike('licenceHolder', `%${filterLicenceHolder}%`)
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
        .groupBy('billRunId')
    })
}

async function _fetchBillRunLicences (id, filterIssues, filterLicenceHolder, filterLicenceStatus) {
  const reviewLicenceQuery = ReviewLicenceModel.query()
    .where('billRunId', id)
    .orderBy([
      { column: 'status', order: 'desc' },
      { column: 'licenceRef', order: 'asc' }
    ])

  _applyFilters(reviewLicenceQuery, filterIssues, filterLicenceHolder, filterLicenceStatus)

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
