'use strict'

const ReportingController = require('../controllers/reporting.controller.js')

const basePath = '/reporting'

const routes = [
  {
    method: 'GET',
    path: basePath,
    options: {
      handler: ReportingController.index,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  },
  {
    method: 'GET',
    path: basePath + '/download',
    options: {
      handler: ReportingController.downloadReturnLogSubmissions,
      auth: {
        access: {
          scope: ['returns']
        }
      }
    }
  }
]

module.exports = routes
