'use strict'

/**
 * Controller for /customers-contacts endpoints
 * @module CustomersContactsController
 */

const ViewManageService = require('../services/customers-contacts/view-manage.service.js')

async function viewManage(request, h) {
  const { id } = request.params

  const pageData = await ViewManageService.go(id)

  return h.view(`customers-contacts/view-manage.njk`, pageData)
}

module.exports = {
  viewManage
}
