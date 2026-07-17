import { placeholder } from '../controllers/check.controller.js'

export default [
  {
    method: 'POST',
    path: '/check/placeholder',
    options: {
      handler: placeholder,
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
