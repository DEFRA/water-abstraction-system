'use strict'

/**
 * Controller for /companies-contacts endpoints
 * @module CompaniesContactsController
 */

const ViewManageService = require('../services/companies-contacts/view-manage.service.js')

async function viewManage(request, h) {
  const {
    params: { id },
    auth
  } = request

  const pageData = await ViewManageService.go(id, auth)

  return h.view(`companies-contacts/view-manage.njk`, pageData)
}

module.exports = {
  viewManage
}
