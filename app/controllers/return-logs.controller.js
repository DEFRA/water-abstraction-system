'use strict'

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

const Boom = require('@hapi/boom')

const ViewReturnLogService = require('../services/return-logs/view-return-log.service.js')

async function view(request, h) {
  const { auth, query } = request

  if (!query.id) {
    return Boom.badImplementation('Id is required')
  }

  const pageData = await ViewReturnLogService.go(query.id, auth)

  return h.view('return-logs/view.njk', { activeNavBar: 'search', ...pageData })
}

module.exports = {
  view
}
