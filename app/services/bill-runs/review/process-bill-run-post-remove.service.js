'use strict'

/**
 * Determines if a two-part tariff bill run is now empty (all licences removed) and if so sets its status to empty
 * @module ProcessBillRunPostRemove
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewLicenceModel = require('../../../models/review-licence.model.js')

/**
 * Determines if a two-part tariff bill run is now empty (all licences removed) and if so sets its status to empty
 *
 * @param {string} billRunId - UUID of the two-part tariff bill run being processed post a review licence being removed
 *
 * @returns {Promise<boolean>} true if it was the last review licence in the bill run, so the bill run is now empty,
 * else false
 */
async function go (billRunId) {
  const empty = await _empty(billRunId)

  if (empty) {
    await _updateStatus(billRunId)
  }

  return empty
}

async function _empty (billRunId) {
  const resultSize = await ReviewLicenceModel.query().select('id').where('billRunId', billRunId).resultSize()

  return resultSize === 0
}

async function _updateStatus (billRunId) {
  return BillRunModel.query().findById(billRunId).patch({ status: 'empty' })
}

module.exports = {
  go
}
