'use strict'

const LicenceMonitoringStationController = require('../controllers/licence-monitoring-station.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licence-monitoring-station/{licenceMonitoringStationId}/remove',
    options: {
      handler: LicenceMonitoringStationController.remove,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  }
]

module.exports = routes
