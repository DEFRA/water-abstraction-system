/**
 * Routes for the /licence-monitoring-station endpoints
 *
 * @module LicenceMonitoringStationRoutes
 */

import { remove, submitRemove } from '../controllers/licence-monitoring-station.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: remove
    },
    path: '/licence-monitoring-station/{licenceMonitoringStationId}/remove'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitRemove
    },
    path: '/licence-monitoring-station/{licenceMonitoringStationId}/remove'
  }
]
