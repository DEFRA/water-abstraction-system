/**
 * Routes for the /return-logs endpoints
 *
 * @module ReturnLogsRoutes
 */

import { download, submitDetails, viewCommunications, viewDetails } from '../controllers/return-logs.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: viewCommunications
    },
    path: '/return-logs/{id}/communications'
  },
  {
    method: 'GET',
    options: {
      handler: viewDetails
    },
    path: '/return-logs/{id}/details'
  },
  {
    method: 'POST',
    options: {
      handler: submitDetails
    },
    path: '/return-logs/{id}/details'
  },
  {
    method: 'GET',
    options: {
      handler: download
    },
    path: '/return-logs/{id}/download'
  }
]
