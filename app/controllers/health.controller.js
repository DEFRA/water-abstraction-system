'use strict'

/**
 * Controller for /health endpoints
 * @module HealthController
 */

const DatabaseHealthCheckService = require('../services/health/database-health-check.service.js')
const InfoService = require('../services/health/info.service.js')

async function airbrake(request, _h) {
  // First section tests connecting to Airbrake through a manual notification
  request.server.app.airbrake.notify({
    message: 'Airbrake manual health check',
    error: new Error('Airbrake manual health check error'),
    session: {
      req: {
        id: request.info.id
      }
    }
  })

  // Second section throws an error and checks that we automatically capture it and then connect to Airbrake
  throw new Error('Airbrake automatic health check error')
}

async function database(_request, h) {
  const result = await DatabaseHealthCheckService.go()

  return h.response(result).code(200)
}

async function info(_request, h) {
  const pageData = await InfoService.go()

  return h.view('health/info.njk', pageData)
}

module.exports = {
  airbrake,
  database,
  info
}
