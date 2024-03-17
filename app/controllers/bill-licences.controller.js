'use strict'

/**
 * Controller for /bill-licences endpoints
 * @module BillLicencesController
 */

const RemoveBillLicenceService = require('../services/bill-licences/remove-bill-licence.service.js')
const ViewBillLicenceService = require('../services/bill-licences/view-bill-licence.service.js')

async function remove (request, h) {
  const { id } = request.params

  const pageData = await RemoveBillLicenceService.go(id)

  return h.view('bill-licences/remove.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

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
  remove,
  view
}
