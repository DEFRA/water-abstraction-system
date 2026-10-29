/**
 * Soft deletes the matching licence monitoring station record
 * @module DeleteLicenceMonitoringStationDal
 */

import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Soft deletes the matching licence monitoring station record
 *
 * @param {string} licenceMonitoringStationId - The UUID for the licence monitoring station record
 */
export default async function deleteLicenceMonitoringStationDal(licenceMonitoringStationId) {
  const timestamp = timestampForPostgres()

  await LicenceMonitoringStationModel.query()
    .update({ deletedAt: timestamp, updatedAt: timestamp })
    .where('id', licenceMonitoringStationId)
}
