'use strict'

/**
 * Controller for /bills endpoints
 * @module BillsController
 */

const ViewBillService = require('../services/bills/view-bill.service.js')

async function view (request, h) {
  const { id } = request.params

  const pageData = await ViewBillService.go(id)

  return h.view('bills/view.njk', {
    pageTitle: `Bill for ${pageData.accountName}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

module.exports = {
  view
}
