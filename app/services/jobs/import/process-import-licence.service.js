'use strict'

/**
 * Process import licence
 * @module ProcessImportLicence
 */

const DetermineSupplementaryBillingFlagsService = require('../../import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../return-logs/process-licence-return-logs.service.js')

/**
 * Process import licence
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
