import { dates, load, seed, tearDown } from '../controllers/data.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/data/dates',
    options: {
      handler: dates,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/data/load',
    options: {
      handler: load,
      app: {
        excludeFromProd: true,
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
    path: '/data/seed',
    options: {
      handler: seed,
      app: {
        excludeFromProd: true,
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
    path: '/data/tear-down',
    options: {
      handler: tearDown,
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

export default routes
