import { remove, submitRemove, view } from '../controllers/bills.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: view
    },
    path: '/bills/{id}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: remove
    },
    path: '/bills/{id}/remove'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitRemove
    },
    path: '/bills/{id}/remove'
  }
]
