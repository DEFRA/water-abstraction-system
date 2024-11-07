'use strict'

/**
 * Extracts and imports licence from NALD
 * @module ImportLicence
 */

const FetchLicences = require('./fetch-licences.service.js')
const ProcessImportLicence = require('./process-import-licence.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Processes NALD licences due for import on a nightly basis
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
 * Instead, we have this job. The one caveat is that it needs to be scheduled to run _after_ the
 * {@link https://github.com/DEFRA/water-abstraction-team/blob/main/jobs/import.md#nald-import | NALD import job},
 * (specifically once the NALD data has been extracted and imported into the `import` schema), but _before_ the
 * {@link https://github.com/DEFRA/water-abstraction-team/blob/main/jobs/import.md#nald-import | Licence import job}
 * runs. This is so these processes can see the differences between the NALD licence record and ours, to determine
 * if and what they need to do.
 *
 * > If a licence in NALD does not have a status of DRAFT, and at least one non-draft licence version then it will be
 * excluded
 *
 */
async function go () {
  try {
    const startTime = currentTimeInNanoseconds()

    const licences = await FetchLicences.go()

    ProcessImportLicence.go(licences)

    calculateAndLogTimeTaken(startTime, `Importing ${licences.length} licences from NALD`)
  } catch (error) {
    global.GlobalNotifier.omfg('Importing Licence job failed', null, error)
  }
}

module.exports = {
  go
}
