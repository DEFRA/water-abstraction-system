'use strict'

/**
 * Fetch bill run(s) that match the options provided
 * @module FetchBillRunsForRegionService
 */

const BillRunModel = require('../../../models/bill-run.model.js')

async function go (regionId, financialYearEnding, supplementary) {
  const liveBillRuns = await _fetchLiveBillRuns(regionId)

  return _matchLiveBillRuns(liveBillRuns, financialYearEnding, supplementary)
}

async function _fetchLiveBillRuns (regionId) {
  return BillRunModel.query()
    .select([
      'id',
      'batchType',
      'billRunNumber',
      'createdAt',
      'scheme',
      'status',
      'summer',
      'toFinancialYearEnding'
    ])
    .where('regionId', regionId)
    .whereIn('status', ['queued', 'processing', 'ready', 'review'])
    .orderBy([
      { column: 'toFinancialYearEnding', order: 'desc' },
      { column: 'createdAt', order: 'desc' }
    ])
}

function _matchLiveBillRuns (liveBillRuns, financialYearEnding, supplementary) {
  const matches = []

  for (const liveBillRun of liveBillRuns) {
    if (!supplementary && liveBillRun.toFinancialYearEnding === financialYearEnding) {
      matches.push(liveBillRun)
      break
    }

    if (liveBillRun.toFinancialYearEnding === financialYearEnding || liveBillRun.toFinancialYearEnding === 2022) {
      matches.push(liveBillRun)
    }
  }

  return matches
}

module.exports = {
  go
}
