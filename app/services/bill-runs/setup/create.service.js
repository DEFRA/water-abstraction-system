'use strict'

/**
 * Used to create the new bill run at the end of the setup bill run journey
 * @module CreateService
 */

const LegacyCreateBillRunRequest = require('../../../requests/legacy/create-bill-run.request.js')
const StartBillRunProcessService = require('../start-bill-run-process.service.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

/**
 * Used to create the new bill run at the end of the setup bill run journey
 *
 * The service needs to determine if it is triggering a bill run in this app, the legacy app or both. The service is
 * intended to work in tandem with the `DetermineBlockingBillRunService`. It assumes that service has been called in
 * order to block calls to this one for bill runs that the two engines will reject because they already exist.
 *
 * Once the bill runs have been triggered it finishes by deleting the setup session. Control is handed back to the
 * controller whilst the engines create and begin building the bill runs.
 *
 * @param {object} session - The bill run setup session instance
 * @param {object} blockingResults - Results of `DetermineBlockingBillRunService`
 * @param {module:UserModel} user - Instance of `UserModel` that represents the user making the request
 */
async function go(session, blockingResults, user) {
  const { region: regionId, type, summer } = session
  const { toFinancialYearEnding, trigger } = blockingResults

  if (trigger === engineTriggers.current || trigger === engineTriggers.both) {
    await StartBillRunProcessService.go(regionId, type, user.username, toFinancialYearEnding)
  }

  if (trigger === engineTriggers.old || trigger === engineTriggers.both) {
    await LegacyCreateBillRunRequest.send(type, regionId, toFinancialYearEnding, user, summer)
  }

  await session.$query().delete()
}

module.exports = {
  go
}
