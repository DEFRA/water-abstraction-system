'use strict'

/**
 * Controller for /bill-runs/review endpoints
 * @module BillRunsReviewController
 */

const AuthorisedService = require('../services/bill-runs/review/authorised.service.js')
const FactorsService = require('../services/bill-runs/review/factors.service.js')
const EditService = require('../services/bill-runs/review/edit.service.js')
const PreviewService = require('../services/bill-runs/review/preview.service.js')
const ReviewChargeElementService = require('../services/bill-runs/review/review-charge-element.service.js')
const ReviewChargeReferenceService = require('../services/bill-runs/review/review-charge-reference.service.js')
const ReviewBillRunService = require('../services/bill-runs/review/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/review/review-licence.service.js')
const SubmitAuthorisedService = require('../services/bill-runs/review/submit-authorised.service.js')
const SubmitEditService = require('..//services/bill-runs/review/submit-edit.service.js')
const SubmitFactorsService = require('../services/bill-runs/review/submit-factors.service.js')
const SubmitReviewBillRunService = require('../services/bill-runs/review/submit-review-bill-run.service.js')
const SubmitReviewLicenceService = require('../services/bill-runs/two-part-tariff/submit-review-licence.service.js')

async function authorised (request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await AuthorisedService.go(reviewChargeReferenceId)

  return h.view('bill-runs/review/authorised.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function edit (request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await EditService.go(reviewChargeElementId, elementIndex)

  return h.view('bill-runs/review/edit.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function factors (request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await FactorsService.go(reviewChargeReferenceId)

  return h.view('bill-runs/review/factors.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function preview (request, h) {
  const { reviewChargeReferenceId } = request.params

  await PreviewService.go(reviewChargeReferenceId, request.yar)

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

async function review (request, h) {
  const { id } = request.params
  const { page } = request.query

  const pageData = await ReviewBillRunService.go(id, page, request.yar)

  return h.view('bill-runs/review/review.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewChargeElement (request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await ReviewChargeElementService.go(reviewChargeElementId, elementIndex, request.yar)

  return h.view('bill-runs/review/review-charge-element.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewChargeReference (request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ReviewChargeReferenceService.go(reviewChargeReferenceId, request.yar)

  return h.view('bill-runs/review/review-charge-reference.njk', {
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

async function submitAuthorised (request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitAuthorisedService.go(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/authorised.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

async function submitEdit (request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await SubmitEditService.go(
    reviewChargeElementId, elementIndex, request.yar, request.payload
  )

  if (pageData.error) {
    return h.view('bill-runs/review/edit.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-element/${reviewChargeElementId}/${elementIndex}`)
}

async function submitFactors (request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitFactorsService.go(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/factors.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
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
  authorised,
  edit,
  factors,
  preview,
  review,
  reviewChargeElement,
  reviewChargeReference,
  reviewLicence,
  submitAuthorised,
  submitEdit,
  submitFactors,
  submitReview,
  submitReviewLicence
}
