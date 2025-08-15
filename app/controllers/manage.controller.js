'use strict'

/**
 * Controller for /manage endpoints
 * @module ManageController
 */

const ViewManageService = require('../services/manage/view-manage.service.js')

async function view(request, h) {
  const pageData = await ViewManageService.go(request.auth.credentials.scope)

  return h.view('manage/manage.njk', pageData)
}

module.exports = {
  view
}
