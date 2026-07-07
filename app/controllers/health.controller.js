/**
 * Controller for /health endpoints
 * @module HealthController
 */

import http2 from 'node:http2'
import DatabaseHealthCheckService from '../services/health/database-health-check.service.js'
import InfoService from '../services/health/info.service.js'

const { HTTP_STATUS_OK } = http2.constants

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

  return h.response(result).code(HTTP_STATUS_OK)
}

async function info(_request, h) {
  const pageData = await InfoService.go()

  return h.view('health/info.njk', pageData)
}

export default {
  airbrake,
  database,
  info
}
