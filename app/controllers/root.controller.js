'use strict'

const ServiceStatusService = require('../services/service_status.service')

class RootController {
  static async index (_req, _h) {
    return { status: 'alive' }
  }

  static helloWorld (_req, h) {
    return h.view('home.njk', {
      title: 'Hello',
      message: 'World',
      pageTitle: 'Hello World!'
    })
  }

  static async serviceStatus (_req, h) {
    const pageData = await ServiceStatusService.go()

    return h.view('service_status.njk', {
      pageTitle: 'Service Status',
      ...pageData
    })
  }
}

module.exports = RootController
