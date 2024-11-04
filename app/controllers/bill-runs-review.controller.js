'use strict'

/**
 * Controller for /bill-runs/review endpoints
 * @module BillRunsReviewController
 */

const AuthorisedService = require('../services/bill-runs/review/authorised.service.js')
const FactorsService = require('../services/bill-runs/review/factors.service.js')
const EditService = require('../services/bill-runs/review/edit.service.js')
const PreviewService = require('../services/bill-runs/review/preview.service.js')
const RemoveService = require('../services/bill-runs/review/remove.service.js')
const ReviewChargeElementService = require('../services/bill-runs/review/review-charge-element.service.js')
const ReviewChargeReferenceService = require('../services/bill-runs/review/review-charge-reference.service.js')
const ReviewBillRunService = require('../services/bill-runs/review/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/review/review-licence.service.js')
const SubmitAuthorisedService = require('../services/bill-runs/review/submit-authorised.service.js')
const SubmitEditService = require('..//services/bill-runs/review/submit-edit.service.js')
const SubmitFactorsService = require('../services/bill-runs/review/submit-factors.service.js')
const SubmitRemoveService = require('../services/bill-runs/review/submit-remove.service.js')
const SubmitReviewBillRunService = require('../services/bill-runs/review/submit-review-bill-run.service.js')
const SubmitReviewLicenceService = require('../services/bill-runs/review/submit-review-licence.service.js')

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

async function remove (request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await RemoveService.go(reviewLicenceId)

  return h.view('bill-runs/review/remove.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewBillRun (request, h) {
  const { billRunId } = request.params
  const { page } = request.query

  const pageData = await ReviewBillRunService.go(billRunId, page, request.yar)

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

async function submitRemove (request, h) {
  const { reviewLicenceId } = request.params

  const result = await SubmitRemoveService.go(reviewLicenceId, request.yar)

  if (result.empty) {
    return h.redirect('/system/bill-runs')
  }

  return h.redirect(`/system/bill-runs/review/${result.billRunId}`)
}

async function submitReviewBillRun (request, h) {
  const { billRunId } = request.params

  await SubmitReviewBillRunService.go(billRunId, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/review/${billRunId}`)
}

async function submitReviewLicence (request, h) {
  const { reviewLicenceId } = request.params

  await SubmitReviewLicenceService.go(reviewLicenceId, request.yar, request.payload)

  return h.redirect(`/system/bill-runs/review/licence/${reviewLicenceId}`)
}

module.exports = {
  authorised,
  edit,
  factors,
  preview,
  remove,
  reviewBillRun,
  reviewChargeElement,
  reviewChargeReference,
  reviewLicence,
  submitAuthorised,
  submitEdit,
  submitFactors,
  submitRemove,
  submitReviewBillRun,
  submitReviewLicence
}
