'use strict'

/**
 * Controller for / endpoints
 * @module SupplementaryController
 */

const ServiceStatusService = require('../services/service-status.service.js')

async function index (_request, _h) {
  return { status: 'alive' }
}

async function serviceStatus (_request, h) {
  const pageData = await ServiceStatusService.go()

  return h.view('service_status.njk', {
    pageTitle: 'Service Status',
    ...pageData
  })
}

module.exports = {
  index,
  serviceStatus
}
