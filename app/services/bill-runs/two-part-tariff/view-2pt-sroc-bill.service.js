'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module View2ptBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { db } = require('../../../../db/db.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (id) {
  const result = _fetchTwoPartTariffBillRun(id)

  return { result }
}

async function _fetchTwoPartTariffBillRun (id) {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchLicences(id)

  return {
    billRun,
    licences
  }
}

async function _fetchLicences (id) {
  const licences = ReviewResultModel.query()
    .where('billRunId', id)
    .select([
      'licenceId'
    ])

  console.log('Licences', licences)
  return licences
}

async function _fetchBillRun (id) {
  const result = BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'batchType',
      'billRunNumber',
      'createdAt',
      'summer',
      'scheme',
      'source',
      'status',
      'toFinancialYearEnding'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })

  return result
}

module.exports = {
  go
}
