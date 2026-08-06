import { index, submitIndex, submitView, view } from '../controllers/notices.controller.js'

export default [
  {
    method: 'GET',
    path: '/notices',
    options: {
      handler: index,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices',
    options: {
      handler: submitIndex,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/notices/{id}',
    options: {
      handler: view,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/notices/{id}',
    options: {
      handler: submitView,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      }
    }
  }
]
