import { remove, submitRemove } from '../controllers/licence-monitoring-station.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/licence-monitoring-station/{licenceMonitoringStationId}/remove',
    options: {
      handler: remove,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/{licenceMonitoringStationId}/remove',
    options: {
      handler: submitRemove,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  }
]

export default routes
