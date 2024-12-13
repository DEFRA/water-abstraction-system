'use strict'

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

const Boom = require('@hapi/boom')

const ReturnLogService = require('../services/return-logs/return-log.service.js')

async function view(request, h) {
  // TODO: Consider whether we want to read the id as a query param or if we want to pass it in the route itself. This
  // would require URL-encoding and -decoding it since ids can contain slashes.
  const { id } = request.query

  if (!id) {
    return Boom.badImplementation('Id is required')
  }

  const pageData = await ReturnLogService.go(request, id)

  return h.view('return-logs/view.njk', { activeNavBar: 'search', ...pageData })
}

module.exports = {
  view
}
