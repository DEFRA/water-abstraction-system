'use strict'

/**
 * Check the end dates of the licence between NALD and WRLS and if changed, records the details for future processing
 * @module CheckLicenceEndDatesService
 */

const DetermineEarliestLicenceChangedDateService = require('./determine-earliest-licence-changed-date.service.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')
const LicenceEndDateChangeModel = require('../../../models/licence-end-date-change.model.js')

/**
 * Check the end dates of the licence between NALD and WRLS and if changed, records the details for future processing
 *
 * @param {object} licence - The licence to check
 */
async function go(licence) {
  let changedDateDetails

  try {
    changedDateDetails = DetermineEarliestLicenceChangedDateService.go(licence)

    if (!changedDateDetails) {
      return
    }

    const timestamp = timestampForPostgres()

    await LicenceEndDateChangeModel.query()
      .insert({ licenceId: licence.id, ...changedDateDetails, createdAt: timestamp, updatedAt: timestamp })
      .onConflict(['licenceId', 'dateType'])
      .merge(['changeDate', 'naldDate', 'wrlsDate', 'updatedAt'])
  } catch (error) {
    global.GlobalNotifier.omfg('Check licence end dates failed', { id: licence.id, changedDateDetails }, error)
  }
}

module.exports = {
  go
}
