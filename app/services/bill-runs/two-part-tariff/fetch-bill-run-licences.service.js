'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Takes the bill run ID and fetches all the data needed to review the bill run
 *
 * Fetches specifically the bill run data, a list of the licences in the bill run with the licence holder and licence
 * ref.
 *
 * @param {String} id The UUID for the bill run
 *
 * @returns {Promise<Object>} an object containing the billRun data and an array of licences for the bill run
 */
async function go (id, payload) {
  const filterLicenceHolder = payload?.filterLicenceHolder

  const billRun = await _fetchBillRun(id)
  const licences = await _fetchBillRunLicences(id, filterLicenceHolder)

  return { billRun, licences, filterLicenceHolder }
}

async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'createdAt',
      'status',
      'toFinancialYearEnding',
      'batchType'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
}

async function _fetchBillRunLicences (id, filterLicenceHolder) {
  const reviewLicenceQuery = ReviewLicenceModel.query()
    .where('billRunId', id)
    .orderBy('status', 'desc')

  if (filterLicenceHolder) {
    reviewLicenceQuery.whereILike('licenceHolder', `%${filterLicenceHolder}%`)
  }

  return reviewLicenceQuery
}

module.exports = {
  go
}
