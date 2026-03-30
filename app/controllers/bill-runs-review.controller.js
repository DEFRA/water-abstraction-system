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
const SubmitAuthorisedService = require('../services/bill-runs/review/submit-authorised.service.js')
const SubmitEditService = require('..//services/bill-runs/review/submit-edit.service.js')
const SubmitFactorsService = require('../services/bill-runs/review/submit-factors.service.js')
const SubmitRemoveService = require('../services/bill-runs/review/submit-remove.service.js')
const SubmitReviewService = require('../services/bill-runs/review/submit-review.service.js')
const SubmitReviewLicenceService = require('../services/bill-runs/review/submit-review-licence.service.js')
const ViewRemoveService = require('../services/bill-runs/review/view-remove.service.js')
const ViewReviewService = require('../services/bill-runs/review/view-review.service.js')
const ViewReviewLicenceService = require('../services/bill-runs/review/view-review-licence.service.js')

async function authorised(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await AuthorisedService.go(reviewChargeReferenceId)

  return h.view('bill-runs/review/authorised.njk', pageData)
}

async function edit(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await EditService.go(reviewChargeElementId, elementIndex)

  return h.view('bill-runs/review/edit.njk', pageData)
}

async function factors(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await FactorsService.go(reviewChargeReferenceId)

  return h.view('bill-runs/review/factors.njk', pageData)
}

async function preview(request, h) {
  const { reviewChargeReferenceId } = request.params

  await PreviewService.go(reviewChargeReferenceId, request.yar)

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

async function reviewChargeElement(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await ReviewChargeElementService.go(reviewChargeElementId, elementIndex, request.yar)

  return h.view('bill-runs/review/review-charge-element.njk', pageData)
}

async function reviewChargeReference(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ReviewChargeReferenceService.go(reviewChargeReferenceId, request.yar)

  return h.view('bill-runs/review/review-charge-reference.njk', pageData)
}

async function submitAuthorised(request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitAuthorisedService.go(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/authorised.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

async function submitEdit(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await SubmitEditService.go(reviewChargeElementId, elementIndex, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/edit.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-element/${reviewChargeElementId}/${elementIndex}`)
}

async function submitFactors(request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitFactorsService.go(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/factors.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

async function submitRemove(request, h) {
  const { reviewLicenceId } = request.params

  const result = await SubmitRemoveService.go(reviewLicenceId, request.yar)

  if (result.empty) {
    return h.redirect('/system/bill-runs')
  }

  return h.redirect(`/system/bill-runs/review/${result.billRunId}`)
}

async function submitReview(request, h) {
  const { billRunId } = request.params

  await SubmitReviewService.go(billRunId, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/review/${billRunId}`)
}

async function submitReviewLicence(request, h) {
  const { reviewLicenceId } = request.params

  await SubmitReviewLicenceService.go(reviewLicenceId, request.yar, request.payload)

  return h.redirect(`/system/bill-runs/review/licence/${reviewLicenceId}`)
}

async function viewRemove(request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await ViewRemoveService.go(reviewLicenceId)

  return h.view('bill-runs/review/remove.njk', pageData)
}

async function viewReview(request, h) {
  const {
    params: { billRunId },
    query: { page },
    yar
  } = request

  const pageData = await ViewReviewService.go(billRunId, yar, page)

  return h.view('bill-runs/review/review.njk', pageData)
}

async function viewReviewLicence(request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await ViewReviewLicenceService.go(reviewLicenceId, request.yar)

  return h.view('bill-runs/review/review-licence.njk', pageData)
}

module.exports = {
  authorised,
  edit,
  factors,
  preview,
  reviewChargeElement,
  reviewChargeReference,
  submitAuthorised,
  submitEdit,
  submitFactors,
  submitRemove,
  submitReview,
  submitReviewLicence,
  viewRemove,
  viewReview,
  viewReviewLicence
}
