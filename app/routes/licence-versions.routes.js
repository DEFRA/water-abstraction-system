import LicenceVersionsController from '../controllers/licence-versions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/licence-versions/{id}',
    options: {
      handler: LicenceVersionsController.view
    }
  }
]

export default routes
