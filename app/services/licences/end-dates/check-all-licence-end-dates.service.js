'use strict'

/**
 * Checks all licences in the NALD extract against those in WRLS and records any with changed end dates
 * @module CheckAllLicenceEndDatesService
 */

const FetchLicences = require('./fetch-licences.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const CheckLicenceEndDatesService = require('./check-licence-end-dates.service.js')

const LicencesConfig = require('../../../../config/licences.config.js')

/**
 * Checks all licences in the NALD extract against those in WRLS and records any with changed end dates
 *
 * Overnight the {@link https://github.com/DEFRA/water-abstraction-import | water-abstraction-import} app imports each
 * abstraction licence found in NALD. New licences are added, existing ones are updated.
 *
 * When an existing licence is imported, there are some additional processes we need to trigger. The first is
 * `DetermineSupplementaryBillingFlagsService`, which checks whether a licence needs to be flagged for supplementary
 * billing if a change has been made.
 *
 * For the same reason, `ProcessLicenceReturnLogsService` needs to check if any changes need to be made to a licence's
 * return logs.
 *
 * Because we are migrating from the legacy apps we couldn't trigger these processes in **water-abstraction-import**.
 * Instead, we have this, which is triggered from the
 * {@link https://github.com/DEFRA/water-abstraction-team/blob/main/jobs/import.md#nald-import | NALD import job}.
 *
 * It compares the records and logs the details of changed licences in `water.licence_end_date_changes. Later, when the
 * {@link https://github.com/DEFRA/water-abstraction-team/blob/main/jobs/import.md#nald-import | Licence import job}
 * runs it will trigger our `/process` end point that will iterate over the changes and process them.
 *
 * > If a licence in NALD does not have a status of DRAFT, and at least one current licence version then it will be
 * excluded
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    // Fetch all licences from NALD and WRLS
    const licences = await FetchLicences.go()

    // Check for any licences with changed end dates
    await _checkLicences(licences)

    // Log the time it took to complete
    calculateAndLogTimeTaken(startTime, 'Check all licence end dates complete', { count: licences.length })
  } catch (error) {
    // Log any errors that occur
    global.GlobalNotifier.omfg('Check all licence end dates failed', null, error)
  }
}

/**
 * Iterate over the licences in batches and check them
 *
 * {@link https://github.com/sindresorhus/p-map | p-map} is a dependency built by the same person who built
 * {@link https://github.com/sindresorhus/got | Got}.
 *
 * > Useful when you need to run promise-returning & async functions multiple times with different inputs concurrently.
 * > This is different from Promise.all() in that you can control the concurrency
 *
 * We had previously crafted something similar, but that involved iterating an array in slices, and then passing the
 * 'slices' to Promise.all(). p-map does the same thing, but much cleaner and the intent is clearer.
 *
 * @private
 */
async function _checkLicences(licences) {
  // The pMap dependency does not support CJS modules. This causes us a problem as we are locked into
  // using these for the time being. We've used the same workaround we used for Got (built by the same person) in
  // app/requests/base.request.js
  const pMap = (await import('p-map')).default

  await pMap(licences, CheckLicenceEndDatesService.go, { concurrency: LicencesConfig.endDates.batchSize })
}

module.exports = {
  go
}
