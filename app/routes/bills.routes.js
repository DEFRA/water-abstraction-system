import { remove, submitRemove, view } from '../controllers/bills.controller.js'

export default [
  {
    method: 'GET',
    path: '/bills/{id}',
    options: {
      handler: view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bills/{id}/remove',
    options: {
      handler: remove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bills/{id}/remove',
    options: {
      handler: submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]
