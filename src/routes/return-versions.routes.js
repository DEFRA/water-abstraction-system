/**
 * Routes for the /return-versions endpoints
 *
 * @module ReturnVersionsRoutes
 */

import { view } from '../controllers/return-versions.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      },
      handler: view
    },
    path: '/return-versions/{id}'
  }
]
