/**
 * Record alert sent successfully by updating the status of a licence monitoring station (tag)
 * @module RecordAlertSentDal
 */

import LicenceMonitoringStationModel from 'water-abstraction-engine/models/licence-monitoring-station.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Record alert sent successfully by updating the status of a licence monitoring station (tag)
 *
 * After checking the status of an abstraction alert with
 * {@link https://www.notifications.service.gov.uk/|GOV.UK Notify}, if the _request_ succeeded, and **Notify** confirms
 * the notification as 'sent', then we want to record against the linked licence monitoring station the type of
 * abstraction alert sent, and when.
 *
 * This allows us to quickly see the current alert 'status' for a licence monitoring station in the service.
 *
 * @param {string} licenceMonitoringStationId - the UUID of the licence monitoring station to update
 * @param {string} status - the status to set for the licence monitoring station
 * @param {string} statusUpdatedAt - the timestamp when the abstraction alert was created
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
export default async function recordAlertSentDal(licenceMonitoringStationId, status, statusUpdatedAt, trx) {
  await LicenceMonitoringStationModel.query(trx)
    .patch({ status, statusUpdatedAt, updatedAt: timestampForPostgres() })
    .findById(licenceMonitoringStationId)
}
