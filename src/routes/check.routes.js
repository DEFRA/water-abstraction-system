import { placeholder } from '../controllers/check.controller.js'

export default [
  {
    method: 'POST',
    options: {
      app: {
        excludeFromProd: true,
        plainOutput: true
      },
      auth: false,
      handler: placeholder,
      plugins: {
        crumb: false
      }
    },
    path: '/check/placeholder'
  }
]
