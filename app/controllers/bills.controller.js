'use strict'

/**
 * Controller for /bills endpoints
 * @module BillsController
 */

const ViewBillService = require('../services/bills/view-bill.service.js')

async function view (request, h) {
  const { id } = request.params

  const pageData = await ViewBillService.go(id)

  const view = _determineView(pageData)

  return h.view(view, {
    pageTitle: `Bill for ${pageData.accountName}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

function _determineView (pageData) {
  if (pageData.billLicences) {
    return 'bills/view-multi-licence.njk'
  }

  if (pageData.scheme === 'sroc') {
    return 'bills/view-single-licence-sroc.njk'
  }

  return 'bills/view-single-licence-presroc.njk'
}

module.exports = {
  view
}
