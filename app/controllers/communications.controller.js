'use strict'

/**
 * Controller for /communications endpoints
 * @module CommunicationsController
 */

const ViewCommunicationsService = require('../services/communications/view-communications.service.js')

async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewCommunicationsService.go(id)

  return h.view('communications/view.njk', pageData)
}

module.exports = {
  view
}
