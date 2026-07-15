/**
 * Check the end dates of the licence between NALD and WRLS and if changed, records the details for future processing
 * @module CheckLicenceEndDatesService
 */

import DetermineEarliestLicenceChangedDateService from './determine-earliest-licence-changed-date.service.js'
import LicenceEndDateChangeModel from '../../../models/licence-end-date-change.model.js'
import { timestampForPostgres } from '../../../lib/general.lib.js'

/**
 * Check the end dates of the licence between NALD and WRLS and if changed, records the details for future processing
 *
 * @param {object} licence - The licence to check
 */
export default async function checkLicenceEndDatesService(licence) {
  let changedDateDetails

  try {
    changedDateDetails = DetermineEarliestLicenceChangedDateService(licence)

    if (!changedDateDetails) {
      return
    }

    const timestamp = timestampForPostgres()

    await LicenceEndDateChangeModel.query()
      .insert({ licenceId: licence.id, ...changedDateDetails, createdAt: timestamp, updatedAt: timestamp })
      .onConflict(['licenceId', 'dateType'])
      .merge(['changeDate', 'naldDate', 'wrlsDate', 'updatedAt'])
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Check licence end dates failed', { id: licence.id, changedDateDetails }, error)
  }
}
