'use strict'

const MonitoringStationsController = require('../controllers/monitoring-stations.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/monitoring-stations/{monitoringStationId}/view',
    options: {
      handler: MonitoringStationsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
