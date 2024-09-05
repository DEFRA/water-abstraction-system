'use strict'

/**
 * Fetch bill run(s) that match the options provided
 * @module FetchMatchingBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Fetch bill run(s) that match the options provided
 *
 * Created to support the setup bill run journey it is used at the end to check if any existing bill runs match the
 * options the user selected.
 *
 * If there is a match we don't attempt to create the bill run and instead direct the user to a page which displays the
 * matching bill run.
 *
 * The complexity is that the criteria for a 'match' changes depending on the bill run type and scheme. The service
 * determines what kind of where clauses to apply to the query depending on these factors. For example, if the bill run
 * type is annual we compare year and region and return anything where the status is not `cancel`, `empty` or `error`.
 * This is because you can only have 1 annual bill run per region per year. For supplementary we also exclude `sending`
 * and `sent` because you can have multiple bill runs in any given year. You just can't have more than one per scheme in
 * a state of being processed.
 *
 * The service always returns an array of results, though if the batch type is annual or two-part tariff it will always
 * only contain 1 match. For Supplementary we ignore scheme in the query which means we may get 2 matching results; one
 * per scheme.
 *
 * @param {string} regionId - UUID of the region the bill run is for
 * @param {string} batchType - The type of bill run
 * @param {number} financialYearEnding - The end year for the financial period the bill run is in
 * @param {boolean} [summer] - Applies only to PRESROC two-part tariff. Whether the bill run is summer or winter
 * all-year
 *
 * @returns {Promise<object[]>} The matching bill run(s) if any. For annual and two-part tariff only one bill run
 * instance will be returned. For supplementary 2 bill runs may be returned depending on whether there is both an SROC
 * and PRESROC in progress.
 */
async function go (regionId, batchType, financialYearEnding, summer = false) {
  const baseQuery = BillRunModel.query()
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
    .where('batchType', batchType)

  _applyWhereClauses(baseQuery, batchType, financialYearEnding, summer)

  return _fetch(baseQuery)
}

function _applyAnnualWhereClauses (query, year) {
  return query
    .where('toFinancialYearEnding', year)
    .whereNotIn('status', ['cancel', 'empty', 'error'])
    .limit(1)
}

function _applySupplementaryWhereClauses (query) {
  return query
    .whereNotIn('status', ['cancel', 'empty', 'error', 'sending', 'sent'])
}

function _applyTwoPartTariffWhereClauses (query, financialYearEnding, summer) {
  if (financialYearEnding <= LAST_PRESROC_YEAR) {
    query.where('summer', summer)
  }

  return query
    .where('toFinancialYearEnding', financialYearEnding)
    .whereNotIn('status', ['cancel', 'empty', 'error'])
    .limit(1)
}

function _applyWhereClauses (baseQuery, batchType, financialYearEnding, summer) {
  if (batchType === 'annual') {
    _applyAnnualWhereClauses(baseQuery, financialYearEnding)
  } else if (batchType === 'supplementary') {
    _applySupplementaryWhereClauses(baseQuery)
  } else {
    _applyTwoPartTariffWhereClauses(baseQuery, financialYearEnding, summer)
  }
}

async function _fetch (baseQuery) {
  return baseQuery
    .orderBy([
      { column: 'toFinancialYearEnding', order: 'desc' },
      { column: 'createdAt', order: 'desc' }
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
}

module.exports = {
  go
}
