/**
 * Routes for the /notifications endpoints
 *
 * @module NotificationsRoutes
 */

import { download, returnedLetter, view } from '../controllers/notifications.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: download
    },
    path: '/notifications/{id}/download'
  },
  {
    method: 'GET',
    options: {
      handler: view
    },
    path: '/notifications/{id}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: { strategy: 'callback' },
      handler: returnedLetter,
      plugins: {
        crumb: false
      }
    },
    path: '/notifications/callbacks/letters'
  }
]
