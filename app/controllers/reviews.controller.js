'use strict'

/**
 * Controller for /reviews endpoints
 * @module ReviewsController
 */

const ReviewBillRunService = require('../services/bill-runs/two-part-tariff/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/two-part-tariff/review-licence.service.js')

async function view (request, h) {
  const { id } = request.params
  const pageData = await ReviewBillRunService.go(id, request.payload)

  return h.view('bill-runs/review.njk', {
    pageTitle: 'Review licences',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function viewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await ReviewLicenceService.go(billRunId, licenceId)

  return h.view('bill-runs/review-licence.njk', {
    pageTitle: `Licence ${pageData.licence.licenceRef}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

module.exports = {
  view,
  viewLicence
}
