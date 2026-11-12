import { check, process } from '../controllers/licences-end-dates.controller.js'

export default [
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: check,
      plugins: {
        crumb: false
      }
    },
    path: '/licences/end-dates/check'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: process,
      plugins: {
        crumb: false
      }
    },
    path: '/licences/end-dates/process'
  }
]
