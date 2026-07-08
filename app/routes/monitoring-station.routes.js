import { licence, view } from '../controllers/monitoring-stations.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/monitoring-stations/{monitoringStationId}',
    options: {
      handler: view
    }
  },
  {
    method: 'GET',
    path: '/monitoring-stations/{monitoringStationId}/licence/{licenceId}',
    options: {
      handler: licence
    }
  }
]

export default routes
