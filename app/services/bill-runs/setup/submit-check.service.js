'use strict'

/**
 * Determines if an existing bill run matches the one a user is trying to setup
 * @module SubmitCheckService
 */

const CheckPresenter = require('../../../presenters/bill-runs/setup/check.presenter.js')
const CreateService = require('./create.service.js')
const DetermineBlockingBillRunService = require('./determine-blocking-bill-run.service.js')
const SessionModel = require('../../../models/session.model.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

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
 * @param {object} auth - The auth object taken from `request.auth` containing user details
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
async function go(sessionId, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const blockingResults = await DetermineBlockingBillRunService.go(session)

  // NOTE: As there is nothing a user can change on the /check page we _should_ never get a POST request from it if a
  // blocking bill run was found. This is just protection against malicious use, or more likely, someone has left the
  // page idle and another user has triggered a bill run that now blocks it.
  if (blockingResults.trigger !== engineTriggers.neither) {
    // Temporary code to end the journey if the bill run type is two-part supplementary as processing this bill run type
    // is not currently possible
    if (session.type !== 'two_part_supplementary') {
      await CreateService.go(session, blockingResults, auth.credentials.user)
    }

    return {}
  }

  const pageData = await CheckPresenter.go(session, blockingResults)

  return {
    activeNavBar: 'bill-runs',
    error: true,
    ...pageData
  }
}

module.exports = {
  go
}
