'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

/**
 * Takes the bill run ID and fetches all the data needed to review the bill run
 *
 * Fetches specifically the bill run data, a list of the licences in the bill run with the licence holder and licence
 * ref.
 * @param {String} id The UUID for the bill run
 *
 * @returns {Object} an object containing the billRun data and the list of licences for the bill run
 */
async function go (id) {
  const billRun = await _fetchBillRun(id)
  const billRunLicences = await _fetchLicenceIds(id)

  for (const billRunLicence of billRunLicences) {
    const licence = await _fetchLicence(billRunLicence.licenceId)

    billRunLicence.licenceHolder = licence.$licenceHolder()
    billRunLicence.licenceRef = licence.licenceRef
  }

  return { billRun, billRunLicences }
}

async function _fetchBillRun (id) {
  const billRun = BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'billRunNumber', // TODO remove this, don't think it's needed. I've not included it in the tests
      'createdAt',
      'status',
      'toFinancialYearEnding',
      'scheme',
      'batchType'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })

  return billRun
}

async function _fetchLicenceIds (id) {
  const licenceIds = ReviewResultModel.query()
    .where('billRunId', id)
    .distinct([
      'licenceId'
    ])

  return licenceIds
}

async function _fetchLicence (licenceId) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
    .modify('licenceHolder')

  return licence
}

module.exports = {
  go
}
