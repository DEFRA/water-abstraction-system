'use strict'

/**
 * Used to create the new bill run at the end of the setup bill run journey
 * @module CreateService
 */

const LegacyCreateBillRunRequest = require('../../../requests/legacy/create-bill-run.request.js')
const StartBillRunProcessService = require('../start-bill-run-process.service.js')

/**
 * Used to create the new bill run at the end of the setup bill run journey
 *
 * The service needs to determine if it is triggering a bill run in this app, the legacy app or both. The service
 * is intended to work in tandem with the `ExistsService`. It assumes that service has been called in order to block
 * calls to this one for bill runs that the two engines will reject because they already exist.
 *
 * Once the bill runs have been triggered it finishes by deleting the setup session. Control is handed back to the
 * controller whilst the engines create and begin building the bill runs.
 *
 * @param {object} session - The bill run setup session instance
 * @param {object} existsResults - Results of `ExistsService`
 * @param {module:UserModel} user - Instance of `UserModel` that represents the user making the request
 */
async function go(session, existsResults, user) {
  const { matches, toFinancialYearEnding } = existsResults
  const { region: regionId, type, summer } = session

  const existingBillRun = matches[0]

  await _triggerBillRun(regionId, type, user, toFinancialYearEnding, existingBillRun)
  await _triggerLegacyBillRun(regionId, type, user, toFinancialYearEnding, summer, existingBillRun)

  await session.$query().delete()
}

async function _triggerBillRun(regionId, batchType, user, toFinancialYearEnding, existingBillRun = null) {
  const { username: userEmail } = user

  // The one case we have to handle is where the user selected supplementary and a match was found, but it was to an
  // SROC supplementary bill run. We've got to this point in the process because it is fine to trigger the PRESROC
  // bill run in the legacy engine. But we can't trigger the SROC one because a match already exists.
  if (batchType === 'supplementary' && existingBillRun?.scheme === 'sroc') {
    return null
  }

  // We do not bother to send requests for PRESROC 2PT bill runs to our engine
  if (batchType === 'two_part_tariff' && [2021, 2022].includes(toFinancialYearEnding)) {
    return null
  }

  return StartBillRunProcessService.go(regionId, batchType, userEmail, toFinancialYearEnding)
}

async function _triggerLegacyBillRun(regionId, batchType, user, toFinancialYearEnding, summer, existingBillRun = null) {
  // The legacy service no longer handles annual billing
  if (batchType === 'annual') {
    return null
  }

  // The one case we have to handle is where the user selected supplementary and a match was found, but it was to a
  // PRESROC supplementary bill run. We've got to this point in the process because it is fine to trigger the SROC
  // bill run in our engine. But we can't trigger the PRESROC one because a match already exists.
  if (batchType === 'supplementary' && existingBillRun?.scheme === 'alcs') {
    return null
  }

  // We do not bother to send requests for SROC 2PT bill runs to the legacy service
  if (batchType === 'two_part_tariff' && [2024, 2023].includes(toFinancialYearEnding)) {
    return null
  }

  return LegacyCreateBillRunRequest.send(batchType, regionId, toFinancialYearEnding, user, summer)
}

module.exports = {
  go
}
