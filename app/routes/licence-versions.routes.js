import { view } from '../controllers/licence-versions.controller.js'

export default [
  {
    method: 'GET',
    path: '/licence-versions/{id}',
    options: {
      handler: view
    }
  }
]
