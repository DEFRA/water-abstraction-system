'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

function licenceMonitoringStations() {
  return [
    {
      abstractionPeriodEndDay: 1,
      abstractionPeriodEndMonth: 1,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 2,
      id: '0',
      licenceRef: generateLicenceRef(),
      measureType: 'flow',
      restrictionType: 'reduce',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdUnit: 'm',
      thresholdValue: 1000
    },
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: '1',
      licenceRef: generateLicenceRef(),
      measureType: 'flow',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdUnit: 'm3/s',
      thresholdValue: 100
    },
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: '2',
      licenceRef: generateLicenceRef(),
      measureType: 'level',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdUnit: 'm',
      thresholdValue: 100
    }
  ]
}

/**
 * Represents a complete response from `MonitoringStationService`
 *
 * We do not use the fetch service for the fixture as we format the data to be in a usable state for the session
 *
 * @returns {object} an object representing the monitoring stations service
 */
function monitoringStation() {
  return {
    licenceMonitoringStations: licenceMonitoringStations(),
    monitoringStationId: generateUUID(),
    monitoringStationName: 'Death star'
  }
}

module.exports = {
  monitoringStation
}
