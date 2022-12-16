'use strict'

const InfoController = require('../controllers/health/info.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/health/info',
    handler: InfoController.index,
    options: {
      auth: false
    }
  }
]

module.exports = routes
