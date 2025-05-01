'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Represents a complete response from `MonitoringStationService`
 *
 * We do not use the fetch service for the fixture as we format the data to be in a usable state for the session
 *
 * @returns {object} an object representing the monitoring stations service
 */
function monitoringStation() {
  return {
    licenceMonitoringStations: [
      {
        abstraction_period_end_day: 1,
        abstraction_period_end_month: 1,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 2,
        licence_id: generateUUID(),
        licence_ref: generateLicenceRef(),
        licence_version_purpose_condition_id: null,
        measure_type: 'flow',
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01').toISOString(),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm',
        threshold_value: 1000
      },
      {
        abstraction_period_end_day: 31,
        abstraction_period_end_month: 3,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 1,
        licence_id: generateUUID(),
        licence_ref: generateLicenceRef(),
        licence_version_purpose_condition_id: generateUUID(),
        measure_type: 'level',
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01').toISOString(),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      }
    ],
    monitoringStationId: generateUUID(),
    monitoringStationName: 'Death star'
  }
}

module.exports = {
  monitoringStation
}
