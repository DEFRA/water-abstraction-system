/**
 * Controller for /reports endpoints
 * @module ReportsController
 */

import ViewInvalidAddressesService from '../services/reports/view-invalid-addresses.service.js'

export async function invalidAddresses(_request, h) {
  const pageData = await ViewInvalidAddressesService()

  return h.view('reports/view-invalid-addresses.njk', pageData)
}
