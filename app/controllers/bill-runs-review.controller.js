'use strict'

/**
 * Controller for /bill-runs/review endpoints
 * @module BillRunsReviewController
 */

const ReviewBillRunService = require('../services/bill-runs/review/review-bill-run.service.js')
const SubmitReviewBillRunService = require('../services/bill-runs/review/submit-review-bill-run.service.js')

async function review (request, h) {
  const { id } = request.params
  const { page } = request.query

  const pageData = await ReviewBillRunService.go(id, page, request.yar)

  return h.view('bill-runs/review/review.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function submitReview (request, h) {
  const { id } = request.params

  await SubmitReviewBillRunService.go(id, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/review/${id}`)
}

module.exports = {
  review,
  submitReview
}
