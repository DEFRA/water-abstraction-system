import { download, returnedLetter, view } from '../controllers/notifications.controller.js'

export default [
  {
    method: 'GET',
    path: '/notifications/{id}/download',
    options: {
      handler: download
    }
  },
  {
    method: 'GET',
    path: '/notifications/{id}',
    options: {
      handler: view
    }
  },
  {
    method: 'POST',
    path: '/notifications/callbacks/letters',
    options: {
      app: {
        plainOutput: true
      },
      auth: { strategy: 'callback' },
      handler: returnedLetter,
      plugins: {
        crumb: false
      }
    }
  }
]
