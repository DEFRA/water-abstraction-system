/**
 * Manages updating the licence monitoring station record as deleted when remove tag is confirmed
 * @module SubmitRemoveService
 */

import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'

import RemoveTagDal from '../../dal/licence-monitoring-station/remove-tag.dal.js'

/**
 * Manages updating the licence monitoring station record as deleted when remove tag is confirmed
 *
 * The licence monitoring station record has the "deleteAt" field set to the current date when a user confirms deletion
 * via the "Remove tag" button.
 *
 * @param {string} licenceMonitoringStationId - The UUID for the licence monitoring station record
 * @param {string} licenceRef - The reference of the licence
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
export default async function submitRemoveService(licenceMonitoringStationId, licenceRef, yar) {
  await RemoveTagDal(licenceMonitoringStationId)

  flashNotification(yar, 'Updated', `Tag removed for ${licenceRef}`)
}
