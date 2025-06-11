'use strict'

/**
 * Manages removing the licence monitoring station record when remove tag is confirmed
 * @module SubmitRemoveService
 */

const GeneralLib = require('../../lib/general.lib.js')
const LicenceMonitoringStationModel = require('../../models/licence-monitoring-station.model.js')

/**
 * Manages removing the licence monitoring station record when remove tag is confirmed
 *
 * The licence monitoring station record is deleted from the database when a user confirms via the "Remove tag" button.
 *
 * @param {string} licenceMonitoringStationId - The UUID for the licence monitoring station record
 * @param {string} licenceRef - The reference of the licence being removed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(licenceMonitoringStationId, licenceRef, yar) {
  await LicenceMonitoringStationModel.query().deleteById(licenceMonitoringStationId)

  GeneralLib.flashNotification(yar, 'Updated', `Tag removed for ${licenceRef}`)
}

module.exports = {
  go
}
