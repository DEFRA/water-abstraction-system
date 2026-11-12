import { index, submitIndex, submitView, view } from '../controllers/notices.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      },
      handler: index
    },
    path: '/notices'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      },
      handler: submitIndex
    },
    path: '/notices'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      },
      handler: view
    },
    path: '/notices/{id}'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      },
      handler: submitView
    },
    path: '/notices/{id}'
  }
]
