/**
 * Removes a tagged licence from a monitoring station by soft deleting the matching licence monitoring station record
 * @module RemoveTagDal
 */

import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Removes a tagged licence from a monitoring station by soft deleting the matching licence monitoring station record
 *
 * @param {string} licenceMonitoringStationId - The UUID for the licence monitoring station record
 */
export default async function removeTagDal(licenceMonitoringStationId) {
  const timestamp = timestampForPostgres()

  await LicenceMonitoringStationModel.query()
    .update({ deletedAt: timestamp, updatedAt: timestamp })
    .where('id', licenceMonitoringStationId)
}
