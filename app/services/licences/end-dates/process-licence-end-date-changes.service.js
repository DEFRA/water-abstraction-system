/**
 * Process all licence end date changes previously recorded
 * @module ProcessLicenceEndDateChangesService
 */

import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'
import LicenceEndDateChangeModel from '../../../models/licence-end-date-change.model.js'
import ProcessBillingFlagService from '../../licences/supplementary/process-billing-flag.service.js'
import ProcessLicenceReturnLogsService from '../../return-logs/process-licence-return-logs.service.js'

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
export default async function processLicenceEndDateChanges() {
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
    globalThis.GlobalNotifier.omfg('Process licence end date changes failed', null, error)
  }
}

async function _billingFlag(licenceEndDateChange) {
  const { changeDate, dateType, licenceId, naldDate, wrlsDate } = licenceEndDateChange
  const payload = { licenceId, changedDateDetails: { changeDate, dateType, naldDate, wrlsDate } }

  await ProcessBillingFlagService(payload)
}

async function _processLicenceEndDateChanges(licenceEndDateChange) {
  try {
    await _billingFlag(licenceEndDateChange)
    await _returnLogs(licenceEndDateChange)

    await licenceEndDateChange.$query().delete()

    globalThis.GlobalNotifier.omg('Process licence end date change complete', { ...licenceEndDateChange })
  } catch (error) {
    // Log any errors that occur
    globalThis.GlobalNotifier.omfg('Process licence end date change failed', { ...licenceEndDateChange }, error)
  }
}

async function _returnLogs(licenceEndDateChange) {
  const { licenceId, changeDate } = licenceEndDateChange

  await ProcessLicenceReturnLogsService(licenceId, changeDate)
}
