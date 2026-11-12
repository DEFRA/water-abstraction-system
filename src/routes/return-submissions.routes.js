/**
 * Routes for the /return-submissions endpoints
 *
 * @module ReturnSubmissionsRoutes
 */

import { view } from '../controllers/return-submissions.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: view
    },
    path: '/return-submissions/{returnSubmissionId}/{yearMonth}'
  }
]
