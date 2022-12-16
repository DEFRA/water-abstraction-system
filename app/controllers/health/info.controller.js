'use strict'

/**
 * Controller for /health/info endpoints
 * @module InfoController
 */

const InfoService = require('../../services/health/info.service.js')

async function index (_request, h) {
  const pageData = await InfoService.go()

  return h.view('service_status.njk', {
    pageTitle: 'Service Status',
    ...pageData
  })
}

module.exports = {
  index
}
