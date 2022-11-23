'use strict'

/**
 * Controller for / endpoints
 * @module SupplementaryController
 */

const ServiceStatusService = require('../services/service_status.service')

class RootController {
  static async index (_request, _h) {
    return { status: 'alive' }
  }

  static helloWorld (_request, h) {
    return h.view('home.njk', {
      title: 'Hello',
      message: 'World',
      pageTitle: 'Hello World!'
    })
  }

  static async serviceStatus (_request, h) {
    const pageData = await ServiceStatusService.go()

    return h.view('service_status.njk', {
      pageTitle: 'Service Status',
      ...pageData
    })
  }
}

module.exports = RootController
