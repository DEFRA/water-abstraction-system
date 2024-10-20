'use strict'

/**
 * Controller for /return-requirement endpoints
 * @module ReturnRequirementsController
 */

const ViewService = require('../services/return-requirements/view.service.js')

async function view (request, h) {
  const { id } = request.params
  const pageData = await ViewService.go(id)

  return h.view('return-requirements/view.njk', {
    ...pageData
  })
}

module.exports = {
  view
}
