'use strict'

/**
 * Controller for /reports endpoints
 * @module ReportsController
 */

const ViewInvalidAddressesService = require('../services/reports/view-invalid-addresses.service.js')

/**
 * Show a list of licences that have addresses with missing postcodes and countries
 *
 * @param _request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function invalidAddresses(_request, h) {
  const pageData = await ViewInvalidAddressesService.go()

  return h.view('reports/view-invalid-addresses.njk', pageData)
}

module.exports = {
  invalidAddresses
}
