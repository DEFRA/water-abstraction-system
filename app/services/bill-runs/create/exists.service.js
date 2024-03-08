'use strict'

/**
 * Determines if an existing bill run matches the one a user is trying to create
 * @module BillRunsCreateExistsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ExistsPresenter = require('../../../presenters/bill-runs/create/exists.presenter.js')
const SessionModel = require('../../../models/session.model.js')

const { currentFinancialYear } = require('../../../lib/general.lib.js')

/**
 * Determines if an existing bill run matches the one a user is trying to create
 *
 * Once the user completes the bill run create journey we first need to check if a matching bill run already exists.
 *
 * The criteria though can differ depending on the details selected. For example, you can only have 1 annual bill run
 * per region per year. Supplementary you can have as many as you like but never more than one in process. Two-part
 * tariff depending on the year you can have either 2 or 1.
 *
 * All this needs to be taken into account when determining if a 'matching' bill run exists. If it does we prepare
 * `pageData` and the controller will redirect the user to the `/bill-runs/create/{sessionId}/exists` page. If it
 * doesn't it will kick off generating the bill run.
 *
 * @param {string} id - The UUID for create bill run session record
 *
 * @returns {Promise<Object>} It always returns the session and the results of looking for matching bill runs plus a
 * `pageData:` property.
 *
 * If no matches were found `pageData` will be `null`.
 *
 * If the bill run to be created is annual or two-part tariff and a match is found `pageData` will be the matching bill
 * run's data formatted for use in the '/exists' page.
 *
 * If the bill run is supplementary and 2 matches are found it returns the most recent match formatted for use in the
 * '/exists' page.
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const yearToUse = _determineYear(session)
  const matchResults = await _fetchMatchingBillRun(session, yearToUse)

  return {
    matchResults,
    pageData: _pageData(session, matchResults),
    session,
    // NOTE: Having determined which year a bill run is for, even for journeys like annual where the user doesn't select
    // one it makes sense to include this for use by downstream services like GenerateService.
    yearToUse
  }
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

function _applyTwoPartTariffQuery (query, year, season) {
  if (['2022', '2021'].includes(year)) {
    query.where('summer', season === 'summer')
  }

  return query
    .where('toFinancialYearEnding', year)
    .whereNotIn('status', ['cancel', 'empty', 'error'])
    .limit(1)
}

function _determineYear (session) {
  const { type, year } = session.data

  if (year && type.startsWith('two_part')) {
    return year
  }

  const { endDate } = currentFinancialYear()

  return endDate.getFullYear()
}

async function _fetchMatchingBillRun (session, year) {
  const { region, season, type } = session.data

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
    .where('regionId', region)
    .where('batchType', type)

  if (type === 'annual') {
    _applyAnnualWhereClauses(baseQuery, year)
  } else if (type === 'supplementary') {
    _applySupplementaryWhereClauses(baseQuery)
  } else {
    _applyTwoPartTariffQuery(baseQuery, year, season)
  }

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

function _pageData (session, matchResults) {
  const { type } = session.data

  // No matches so we can create the bill run
  if (matchResults.length === 0) {
    return null
  }

  // You can only have one SROC and PRESROC supplementary being processed at any time. If less than 2 then we can create
  // a bill run
  if (type === 'supplementary' && matchResults.length < 2) {
    return null
  }

  // We have a match so format the bill run for the /exists page
  return ExistsPresenter.go(session, matchResults[0])
}

module.exports = {
  go
}
