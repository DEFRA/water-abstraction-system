'use strict'

/**
 * Process licence for the licences imported from NALD
 * @module ProcessImportLicence
 */

const DetermineSupplementaryBillingFlagsService = require('../../import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../return-logs/process-licence-return-logs.service.js')

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
async function go (licence) {
  try {
    const endDates = {
      expiredDate: licence.expired_date,
      lapsedDate: licence.lapsed_date,
      revokedDate: licence.revoked_date
    }

    await DetermineSupplementaryBillingFlagsService.go(endDates, licence.id)

    await ProcessLicenceReturnLogsService.go(licence.id)
  } catch (error) {
    global.GlobalNotifier.omfg(`Importing licence ${licence.id}`, null, error)
  }
}

module.exports = {
  go
}
