'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Takes the bill run ID and fetches all the data needed to review the bill run
 *
 * Fetches specifically the bill run data, a list of the licences in the bill run with the licence holder and licence
 * ref.
 * @param {String} id The UUID for the bill run
 *
 * @returns {Object} an object containing the billRun data and an array of licences for the bill run
 */
async function go (id) {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchLicences(id)

  return { billRun, licences }
}

async function _fetchBillRun (id) {
  const billRun = await BillRunModel.query()
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

  return billRun
}

async function _fetchLicences (id) {
  const licences = await LicenceModel.query()
    .distinct([
      'licences.id',
      'licenceRef'
    ])
    .innerJoinRelated('reviewResults')
    .where('billRunId', id)
    .modify('licenceHolder')

  for (const licence of licences) {
    licence.licenceHolder = licence.$licenceHolder()
  }

  return licences
}

module.exports = {
  go
}
