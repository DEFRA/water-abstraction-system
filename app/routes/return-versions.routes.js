import { view } from '../controllers/return-versions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/return-versions/{id}',
    options: {
      handler: view,
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      }
    }
  }
]

export default routes
