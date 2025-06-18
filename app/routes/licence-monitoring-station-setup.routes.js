'use strict'

const LicenceMonitoringStationSetupController = require('../controllers/licence-monitoring-station-setup.controller.js')

const routes = [
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup',
    options: {
      handler: LicenceMonitoringStationSetupController.submitSetup,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: LicenceMonitoringStationSetupController.thresholdAndUnit,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: LicenceMonitoringStationSetupController.submitThresholdAndUnit,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce',
    options: {
      handler: LicenceMonitoringStationSetupController.stopOrReduce,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce',
    options: {
      handler: LicenceMonitoringStationSetupController.submitStopOrReduce,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number',
    options: {
      handler: LicenceMonitoringStationSetupController.licenceNumber,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number',
    options: {
      handler: LicenceMonitoringStationSetupController.submitLicenceNumber,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period',
    options: {
      handler: LicenceMonitoringStationSetupController.abstractionPeriod,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period',
    options: {
      handler: LicenceMonitoringStationSetupController.submitAbstractionPeriod,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  }
]

module.exports = routes
