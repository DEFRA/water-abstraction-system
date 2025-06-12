'use strict'

/**
 * Manages updating the licence monitoring station record as deleted when remove tag is confirmed
 * @module SubmitRemoveService
 */

const GeneralLib = require('../../lib/general.lib.js')
const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')

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
async function go(licenceMonitoringStationId, licenceRef, yar) {
  await LicenceMonitoringStationModel.query().update({ deletedAt: new Date() }).where('id', licenceMonitoringStationId)

  GeneralLib.flashNotification(yar, 'Updated', `Tag removed for ${licenceRef}`)
}

module.exports = {
  go
}
