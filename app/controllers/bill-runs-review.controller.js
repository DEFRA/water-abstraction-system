'use strict'

/**
 * Controller for /bill-runs/review endpoints
 * @module BillRunsReviewController
 */

const ReviewChargeReferenceService = require('../services/bill-runs/two-part-tariff/charge-reference-details.service.js')
const ReviewBillRunService = require('../services/bill-runs/review/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/review/review-licence.service.js')
const SubmitReviewBillRunService = require('../services/bill-runs/review/submit-review-bill-run.service.js')
const SubmitReviewLicenceService = require('../services/bill-runs/two-part-tariff/submit-review-licence.service.js')

async function review (request, h) {
  const { id } = request.params
  const { page } = request.query

  const pageData = await ReviewBillRunService.go(id, page, request.yar)

  return h.view('bill-runs/review/review.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewChargeReference (request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ReviewChargeReferenceService.go(reviewChargeReferenceId, request.yar)

  return h.view('bill-runs/charge-reference-details.njk', {
    pageTitle: 'Charge reference details',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewLicence (request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await ReviewLicenceService.go(reviewLicenceId, request.yar)

  return h.view('bill-runs/review/review-licence.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function submitReview (request, h) {
  const { id } = request.params

  await SubmitReviewBillRunService.go(id, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/review/${id}`)
}

async function submitReviewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  await SubmitReviewLicenceService.go(billRunId, licenceId, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}`)
}

module.exports = {
  review,
  reviewChargeReference,
  reviewLicence,
  submitReview,
  submitReviewLicence
}
