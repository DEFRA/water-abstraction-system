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
          scope: ['returns']
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
          scope: ['returns']
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
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
