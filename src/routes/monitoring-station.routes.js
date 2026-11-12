import { licence, view } from '../controllers/monitoring-stations.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: view
    },
    path: '/monitoring-stations/{monitoringStationId}'
  },
  {
    method: 'GET',
    options: {
      handler: licence
    },
    path: '/monitoring-stations/{monitoringStationId}/licence/{licenceId}'
  }
]
