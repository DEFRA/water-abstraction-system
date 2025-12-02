'use strict'

/**
 * Controller for /licences-versions endpoints
 * @module LicenceVersionsController
 */

const ViewService = require('../services/licence-versions/view.service.js')

async function view(request, h) {
  const pageData = await ViewService.go()

  return h.view(`licence-versions/view.njk`, pageData)
}

module.exports = {
  view
}
