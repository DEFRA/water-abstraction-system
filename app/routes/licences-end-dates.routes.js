import { check, process } from '../controllers/licences-end-dates.controller.js'

export default [
  {
    method: 'POST',
    path: '/licences/end-dates/check',
    options: {
      handler: check,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'POST',
    path: '/licences/end-dates/process',
    options: {
      handler: process,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]
