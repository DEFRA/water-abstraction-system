/**
 * Controller for /reports endpoints
 * @module ReportsController
 */

import ViewInvalidAddressesService from '../services/reports/view-invalid-addresses.service.js'

async function invalidAddresses(_request, h) {
  const pageData = await ViewInvalidAddressesService.go()

  return h.view('reports/view-invalid-addresses.njk', pageData)
}

export {
  invalidAddresses
}
export default {
  invalidAddresses
}
