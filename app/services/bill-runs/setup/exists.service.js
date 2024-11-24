'use strict'

/**
 * Determines if an existing bill run matches the one a user is trying to setup
 * @module ExistsService
 */

const CreatePresenter = require('../../../presenters/bill-runs/setup/create.presenter.js')
const DetermineBlockingBillRunService = require('../determine-blocking-bill-run.service.js')
const DetermineFinancialYearEndService = require('./determine-financial-year-end.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Determines if an existing bill run matches the one a user is trying to setup
 *
 * Once the user completes the bill run setup journey we first need to check if a matching bill run already exists.
 *
 * The criteria though can differ depending on the details selected. For example, you can only have 1 annual bill run
 * per region per year. Supplementary you can have as many as you like but never more than one in process. Two-part
 * tariff depending on the year you can have either 2 or 1.
 *
 * All this needs to be taken into account when determining if a 'matching' bill run exists. If it does we prepare
 * `pageData` and the controller will render the `create` page. If it doesn't it will kick off generating the bill run.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} It always returns the session and the results of looking for matching bill runs plus a
 * `pageData:` property.
 *
 * If no matches are found `pageData` will be `null`.
 *
 * If the bill run to be setup is annual or two-part tariff and a match is found `pageData` will be the matching bill
 * run's data formatted for use in the '/exists' page.
 *
 * If the bill run is supplementary and 2 matches are found it returns the most recent match formatted for use in the
 * '/exists' page.
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { region, type, year } = session
  const yearToUse = await DetermineFinancialYearEndService.go(region, type, year)

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

async function _fetchMatchingBillRun(session, year) {
  const { region, season, type } = session

  return DetermineBlockingBillRunService.go(region, type, year, season)
}

function _pageData(session, matchResults) {
  const { type } = session

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
  return CreatePresenter.go(session, matchResults[0])
}

module.exports = {
  go
}
