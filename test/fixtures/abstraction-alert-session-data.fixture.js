'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Create licence monitoring station test data
 *
 * @returns {object} - Returns three unique licence monitoring stations
 */
function licenceMonitoringStations() {
  return {
    one: {
      abstractionPeriodEndDay: 1,
      abstractionPeriodEndMonth: 1,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 2,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'reduce',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-1000-m',
      thresholdUnit: 'm',
      thresholdValue: 1000
    },
    two: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'flow',
      notes: 'I have a bad feeling about this',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-100-m3/s',
      thresholdUnit: 'm3/s',
      thresholdValue: 100
    },
    three: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-100-m',
      thresholdUnit: 'm',
      thresholdValue: 100
    }
  }
}

/**
 * Create licence monitoring station test data
 *
 * @returns {object} - Returns nine unique unsorted licence monitoring stations
 */
function unsortedLicenceMonitoringStations() {
  return {
    one: {
      abstractionPeriodEndDay: 1,
      abstractionPeriodEndMonth: 1,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 2,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'reduce',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-1000-m',
      thresholdUnit: 'm',
      thresholdValue: 1000
    },
    two: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'flow',
      notes: 'I have a bad feeling about this',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-100-m3/s',
      thresholdUnit: 'm3/s',
      thresholdValue: 100
    },
    three: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        licenceRef: generateLicenceRef(),
        id: generateUUID()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-100-m',
      thresholdUnit: 'm',
      thresholdValue: 100
    },
    four: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'flow',
      notes: null,
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-10-l/s',
      thresholdUnit: 'l/s',
      thresholdValue: 10
    },
    five: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'flow',
      notes: 'minor abstraction',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-5000-gpd',
      thresholdUnit: 'gpd',
      thresholdValue: 5000
    },
    six: {
      abstractionPeriodEndDay: 15,
      abstractionPeriodEndMonth: 9,
      abstractionPeriodStartDay: 15,
      abstractionPeriodStartMonth: 6,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'reduce',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-2-mBOD',
      thresholdUnit: 'mBOD',
      thresholdValue: 2
    },
    seven: {
      abstractionPeriodEndDay: 30,
      abstractionPeriodEndMonth: 9,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'flow',
      notes: null,
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-0.5-Ml/d',
      thresholdUnit: 'Ml/d',
      thresholdValue: 0.5
    },
    eight: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'flow',
      notes: 'uses imperial units',
      restrictionType: 'stop',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'flow-1-Mgpd',
      thresholdUnit: 'Mgpd',
      thresholdValue: 1
    },
    nine: {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 8,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 5,
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      },
      measureType: 'level',
      notes: null,
      restrictionType: 'reduce',
      status: 'resume',
      statusUpdatedAt: null,
      thresholdGroup: 'level-50-SLD',
      thresholdUnit: 'SLD',
      thresholdValue: 50
    }
  }
}

/**
 * Represents a complete response from `MonitoringStationService`
 *
 * We do not use the fetch service for the fixture as we format the data to be in a usable state for the session
 *
 * @param {object} [_licenceMonitoringStations] - override the default licenceMonitoringStations
 *
 * @returns {object} an object representing the monitoring stations service
 */
function get(_licenceMonitoringStations) {
  const lms = _licenceMonitoringStations || licenceMonitoringStations()

  return {
    licenceMonitoringStations: [...Object.values(lms)],
    monitoringStationId: generateUUID(),
    monitoringStationName: 'Death star',
    monitoringStationRiverName: 'Meridian Trench'
  }
}

/**
 * Relevant licence monitoring stations are licence monitoring stations selected by the user to receive alert
 * notifications.
 *
 * This is a necessary complexity to the test setup. Each test was previously creating this array of relevant
 * licence monitoring stations. This helper function should simplify the test setup.
 *
 * We mainly need to map licence monitoring stations to recipients. This is done through matching the licence ref.
 *
 * @param {string[]} licenceRefs
 * @param {object} [_licenceMonitoringStations] - override the default licenceMonitoringStations
 *
 * @returns {object[]} an array of the licence monitoring station
 */
function relevantLicenceMonitoringStations(licenceRefs, _licenceMonitoringStations) {
  const lms = _licenceMonitoringStations || licenceMonitoringStations()

  const lmsArray = [...Object.values(lms)]

  for (let i = 0; i < licenceRefs.length; i++) {
    lmsArray[i].licence.licenceRef = licenceRefs[i]
  }

  return lmsArray
}

module.exports = {
  get,
  licenceMonitoringStations,
  relevantLicenceMonitoringStations,
  unsortedLicenceMonitoringStations
}
