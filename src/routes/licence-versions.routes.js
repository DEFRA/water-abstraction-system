/**
 * Routes for the /licence-versions endpoints
 *
 * @module LicenceVersionsRoutes
 */

import { view } from '../controllers/licence-versions.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: view
    },
    path: '/licence-versions/{id}'
  }
]
