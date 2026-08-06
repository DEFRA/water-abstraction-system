import { licence, view } from '../controllers/monitoring-stations.controller.js'

export default [
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
