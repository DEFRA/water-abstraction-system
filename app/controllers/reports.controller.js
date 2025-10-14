'use strict'

/**
 * Controller for /reports endpoints
 * @module ReportsController
 */

const ViewInvalidAddressesService = require('../services/reports/view-invalid-addresses.service.js')

async function invalidAddresses(_request, h) {
  const pageData = await ViewInvalidAddressesService.go()

  return h.view('reports/view-invalid-addresses.njk', pageData)
}

module.exports = {
  invalidAddresses
}
