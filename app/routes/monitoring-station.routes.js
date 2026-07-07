import MonitoringStationsController from '../controllers/monitoring-stations.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/monitoring-stations/{monitoringStationId}',
    options: {
      handler: MonitoringStationsController.view
    }
  },
  {
    method: 'GET',
    path: '/monitoring-stations/{monitoringStationId}/licence/{licenceId}',
    options: {
      handler: MonitoringStationsController.licence
    }
  }
]

export default routes
