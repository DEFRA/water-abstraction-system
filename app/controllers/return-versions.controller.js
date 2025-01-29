'use strict'

/**
 * Controller for /return-versions endpoints
 * @module ReturnVersionsController
 */

const ViewService = require('../services/return-versions/view.service.js')

async function view(request, h) {
  const { id } = request.params
  const pageData = await ViewService.go(id)

  return h.view('return-versions/view.njk', pageData)
}

module.exports = {
  view
}
