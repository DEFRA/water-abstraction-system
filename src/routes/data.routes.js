import { seed } from '../controllers/data.controller.js'

export default [
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
  }
]
