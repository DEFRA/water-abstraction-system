import { remove, submitRemove, view } from '../controllers/bill-licences.controller.js'

export default [
  {
    method: 'GET',
    path: '/bill-licences/{id}',
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
    path: '/bill-licences/{id}/remove',
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
    path: '/bill-licences/{id}/remove',
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
