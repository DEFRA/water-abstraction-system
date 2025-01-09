'use strict'

/**
 * Process all licence end date changes previously recorded
 * @module ProcessLicenceEndDateChangesService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const LicenceEndDateChangeModel = require('../../../models/licence-end-date-change.model.js')
const ProcessBillingFlagService = require('../../licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../../return-logs/process-licence-return-logs.service.js')

const FeatureFlags = require('../../../../config/feature-flags.config.js')

/**
 * Process all licence end date changes previously recorded
 *
 * Fetches all `licence_end_date_changes` recorded during the
 * {@link https://github.com/DEFRA/water-abstraction-team/blob/main/jobs/import.md#nald-import | NALD import job} then
 * iterates through them, calling `ProcessBillingFlagService` and `ProcessLicenceReturnLogsService`.
 *
 * These downstream services depend on knowing when a licence's end dates have changed so they can determine what
 * billing flags need to be set, or what return logs need reissuing.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const licenceEndDateChanges = await LicenceEndDateChangeModel.query().select([
      'id',
      'licenceId',
      'dateType',
      'changeDate',
      'naldDate',
      'wrlsDate'
    ])

    for (const licenceEndDateChange of licenceEndDateChanges) {
      await _processLicenceEndDateChanges(licenceEndDateChange)
    }

    // Log the time it took to complete
    calculateAndLogTimeTaken(startTime, 'Process licence end date changes complete', {
      count: licenceEndDateChanges?.length
    })
  } catch (error) {
    // Log any errors that occur
    global.GlobalNotifier.omfg('Process licence end date changes failed', null, error)
  }
}

async function _billingFlag(licenceEndDateChange) {
  const { changeDate, dateType, licenceId, naldDate, wrlsDate } = licenceEndDateChange
  const payload = { licenceId, changedDateDetails: { changeDate, dateType, naldDate, wrlsDate } }

  await ProcessBillingFlagService.go(payload)
}

async function _processLicenceEndDateChanges(licenceEndDateChange) {
  try {
    await _billingFlag(licenceEndDateChange)
    await _returnLogs(licenceEndDateChange)

    await licenceEndDateChange.$query().delete()

    global.GlobalNotifier.omg('Process licence end date change complete', { ...licenceEndDateChange })
  } catch (error) {
    // Log any errors that occur
    global.GlobalNotifier.omfg('Process licence end date change failed', { ...licenceEndDateChange }, error)
  }
}

async function _returnLogs(licenceEndDateChange) {
  const { licenceId, changeDate } = licenceEndDateChange

  if (FeatureFlags.enableRequirementsForReturns) {
    await ProcessLicenceReturnLogsService.go(licenceId, changeDate)
  }
}

module.exports = {
  go
}
