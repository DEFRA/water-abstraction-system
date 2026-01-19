'use strict'

/**
 * Controller for /customers/{customerId}/contact/{contactId} endpoints
 * @module CustomersContactController
 */

const ViewManageService = require('../services/customers/contact/view-manage.service.js')

async function viewManage(request, h) {
  const { customerId, contactId } = request.params

  const pageData = await ViewManageService.go(customerId, contactId)

  return h.view(`customers/contact/view-manage.njk`, pageData)
}

module.exports = {
  viewManage
}
