import AirbrakeController from '../controllers/health/airbrake.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/health/airbrake',
    handler: AirbrakeController.index,
    options: {
      description: 'Used by the delivery team to confirm error logging is working correctly in an environment. ' +
        'NOTE. We expect this endpoint to return a 500'
    }
  }
]

export default routes
