'use strict'

/**
 * Controller for /bill-licences endpoints
 * @module BillLicencesController
 */

const ViewBillLicenceService = require('../services/bill-licences/view-bill-licence.service.js')

async function view (request, h) {
  const { id } = request.params

  const pageData = await ViewBillLicenceService.go(id)

  const view = pageData.scheme === 'sroc' ? 'view-sroc.njk' : 'view-presroc.njk'

  return h.view(`bill-licences/${view}`, {
    pageTitle: `Transactions for ${pageData.licenceRef}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

module.exports = {
  view
}
