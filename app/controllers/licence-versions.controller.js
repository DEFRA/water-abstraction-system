'use strict'

/**
 * Controller for /licence-versions endpoints
 * @module LicenceVersionsController
 */

const ViewService = require('../services/licence-versions/view.service.js')

async function view(request, h) {
  const { id } = request.params
  const pageData = await ViewService.go(id)

  return h.view('licence-versions/view.njk', pageData)
}

module.exports = {
  view
}
