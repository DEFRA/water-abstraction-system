'use strict'

const LicenceMonitoringStationSetupController = require('../controllers/licence-monitoring-station-setup.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup',
    options: {
      handler: LicenceMonitoringStationSetupController.submitSetup
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: LicenceMonitoringStationSetupController.thresholdAndUnit
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: LicenceMonitoringStationSetupController.submitThresholdAndUnit
    }
  }
]

module.exports = routes
