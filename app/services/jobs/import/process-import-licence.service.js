'use strict'

/**
 * Process licence for the licences imported from NALD
 * @module ProcessImportLicence
 */

const DetermineLicenceEndDateChangedService = require('./determine-licence-end-date-changed.service')
const ProcessBillingFlagService = require('../../licences/supplementary/process-billing-flag.service')
const GenerateReturnLogsService = require('../../import/generate-return-logs.service')

/**
 * Process licence for the licences imported from NALD
 *
 * When the licence exists in the WRLS databse and we are improting from NALD.
 *
 * We need to check if the licence needs to be flagged for supplementary billing and
 * determine if any new return logs need to be created depending on the current cycle.
 *
 * @param {object} licence - a licence
 */
async function go(licence) {
  try {
    const payload = {
      expiredDate: licence.expired_date,
      lapsedDate: licence.lapsed_date,
      revokedDate: licence.revoked_date,
      licenceId: licence.id
    }

    const licenceEndDateChanged = await DetermineLicenceEndDateChangedService.go(payload, licence.id)

    if (licenceEndDateChanged) {
      ProcessBillingFlagService.go(payload)
      GenerateReturnLogsService.go(licence.id, payload)
    }
  } catch (error) {
    global.GlobalNotifier.omfg(`Importing licence ${licence.id}`, null, error)
  }
}

module.exports = {
  go
}
