'use strict'

/**
 * Controller for /returns endpoints
 * @module ReturnsController
 */

const Boom = require('@hapi/boom')

const ReturnLogService = require('../services/returns/return-log.service.js')

async function returnLog(request, h) {
  // TODO: Consider whether we want to read the id as a query param or if we want to pass it in the route itself. This
  // would require URL-encoding and -decoding it since ids can contain slashes.
  const { id } = request.query

  if (!id) {
    return Boom.badImplementation('Id is required')
  }

  const data = await ReturnLogService.go(request, id)
  // TODO: Remove this as we only include it to check the data we receive
  const dataString = JSON.stringify(data, null, 2)

  return h.view('returns/return-log.njk', { data, dataString })
}

module.exports = {
  returnLog
}
