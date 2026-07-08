import { view } from '../controllers/licence-versions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/licence-versions/{id}',
    options: {
      handler: view
    }
  }
]

export default routes
