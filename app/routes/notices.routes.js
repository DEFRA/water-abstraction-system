'use strict'

const NoticesController = require('../controllers/notices.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/notices',
    options: {
      handler: NoticesController.index,
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
      handler: NoticesController.submitIndex,
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
      handler: NoticesController.view,
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
      handler: NoticesController.submitView,
      auth: {
        access: {
          scope: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']
        }
      }
    }
  }
]

module.exports = routes
