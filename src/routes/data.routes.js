import { seed } from '../controllers/data.controller.js'

export default [
  {
    method: 'POST',
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      handler: seed,
      plugins: {
        crumb: false
      }
    },
    path: '/data/seed'
  }
]
