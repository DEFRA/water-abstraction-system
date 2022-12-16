'use strict'

/**
 * Controller for /health/info endpoints
 * @module InfoController
 */

const InfoService = require('../../services/health/info.service.js')

async function index (_request, h) {
  const pageData = await InfoService.go()

  return h.view('info.njk', {
    pageTitle: 'Info',
    ...pageData
  })
}

module.exports = {
  index
}
