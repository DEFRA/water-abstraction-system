'use strict'

const NoticesController = require('../controllers/notices.controller.js')

const basePath = '/notices'

const routes = [
  {
    method: 'GET',
    path: basePath,
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
    path: basePath,
    options: {
      handler: NoticesController.submitIndex,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
