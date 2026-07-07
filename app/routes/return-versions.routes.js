import ReturnVersionsController from '../controllers/return-versions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/return-versions/{id}',
    options: {
      handler: ReturnVersionsController.view,
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      }
    }
  }
]

export default routes
