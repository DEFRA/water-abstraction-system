import { index } from '../controllers/root.controller.js'

export default [
  {
    method: 'GET',
    path: '/',
    options: {
      handler: index,
      app: {
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    options: {
      handler: {
        file: 'app/public/static/robots.txt'
      },
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    options: {
      handler: index,
      app: {
        plainOutput: true
      },
      auth: false
    }
  }
]
