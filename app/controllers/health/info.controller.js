'use strict'

/**
 * Controller for /health/info endpoints
 * @module InfoController
 */

const ServiceStatusService = require('../../services/service-status.service.js')

async function index (_request, h) {
  const pageData = await ServiceStatusService.go()

  return h.view('service_status.njk', {
    pageTitle: 'Service Status',
    ...pageData
  })
}

module.exports = {
  index
}
