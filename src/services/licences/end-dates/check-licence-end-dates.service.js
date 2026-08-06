/**
 * Check the end dates of the licence between NALD and WRLS and if changed, records the details for future processing
 * @module CheckLicenceEndDatesService
 */

import LicenceEndDateChangeModel from 'water-abstraction-engine/models/licence-end-date-change.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

import DetermineEarliestLicenceChangedDateService from './determine-earliest-licence-changed-date.service.js'

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
