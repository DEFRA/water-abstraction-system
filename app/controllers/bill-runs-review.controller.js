/**
 * Controller for /bill-runs/review endpoints
 * @module BillRunsReviewController
 */

import PreviewService from '../services/bill-runs/review/preview.service.js'
import SubmitAuthorisedService from '../services/bill-runs/review/submit-authorised.service.js'
import SubmitEditService from '..//services/bill-runs/review/submit-edit.service.js'
import SubmitFactorsService from '../services/bill-runs/review/submit-factors.service.js'
import SubmitRemoveService from '../services/bill-runs/review/submit-remove.service.js'
import SubmitReviewLicenceService from '../services/bill-runs/review/submit-review-licence.service.js'
import SubmitReviewService from '../services/bill-runs/review/submit-review.service.js'
import ViewAuthorisedService from '../services/bill-runs/review/view-authorised.service.js'
import ViewEditService from '../services/bill-runs/review/view-edit.service.js'
import ViewFactorsService from '../services/bill-runs/review/view-factors.service.js'
import ViewRemoveService from '../services/bill-runs/review/view-remove.service.js'
import ViewReviewChargeElementService from '../services/bill-runs/review/view-review-charge-element.service.js'
import ViewReviewChargeReferenceService from '../services/bill-runs/review/view-review-charge-reference.service.js'
import ViewReviewLicenceService from '../services/bill-runs/review/view-review-licence.service.js'
import ViewReviewService from '../services/bill-runs/review/view-review.service.js'

export async function preview(request, h) {
  const { reviewChargeReferenceId } = request.params

  await PreviewService(reviewChargeReferenceId, request.yar)

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

export async function submitAuthorised(request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitAuthorisedService(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/authorised.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

export async function submitEdit(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await SubmitEditService(reviewChargeElementId, elementIndex, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/edit.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-element/${reviewChargeElementId}/${elementIndex}`)
}

export async function submitFactors(request, h) {
  const { reviewChargeReferenceId } = request.params
  const pageData = await SubmitFactorsService(reviewChargeReferenceId, request.yar, request.payload)

  if (pageData.error) {
    return h.view('bill-runs/review/factors.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/review/charge-reference/${reviewChargeReferenceId}`)
}

export async function submitRemove(request, h) {
  const { reviewLicenceId } = request.params

  const result = await SubmitRemoveService(reviewLicenceId, request.yar)

  if (result.empty) {
    return h.redirect('/system/bill-runs')
  }

  return h.redirect(`/system/bill-runs/review/${result.billRunId}`)
}

export async function submitReview(request, h) {
  const { billRunId } = request.params

  await SubmitReviewService(billRunId, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/review/${billRunId}`)
}

export async function submitReviewLicence(request, h) {
  const { reviewLicenceId } = request.params

  await SubmitReviewLicenceService(reviewLicenceId, request.yar, request.payload)

  return h.redirect(`/system/bill-runs/review/licence/${reviewLicenceId}`)
}

export async function viewAuthorised(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ViewAuthorisedService(reviewChargeReferenceId)

  return h.view('bill-runs/review/authorised.njk', pageData)
}

export async function viewEdit(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await ViewEditService(reviewChargeElementId, elementIndex)

  return h.view('bill-runs/review/edit.njk', pageData)
}

export async function viewFactors(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ViewFactorsService(reviewChargeReferenceId)

  return h.view('bill-runs/review/factors.njk', pageData)
}

export async function viewRemove(request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await ViewRemoveService(reviewLicenceId)

  return h.view('bill-runs/review/remove.njk', pageData)
}

export async function viewReview(request, h) {
  const {
    params: { billRunId },
    query: { page },
    yar
  } = request

  const pageData = await ViewReviewService(billRunId, yar, page)

  return h.view('bill-runs/review/review.njk', pageData)
}

export async function viewReviewChargeElement(request, h) {
  const { elementIndex, reviewChargeElementId } = request.params

  const pageData = await ViewReviewChargeElementService(reviewChargeElementId, elementIndex, request.yar)

  return h.view('bill-runs/review/review-charge-element.njk', pageData)
}

export async function viewReviewChargeReference(request, h) {
  const { reviewChargeReferenceId } = request.params

  const pageData = await ViewReviewChargeReferenceService(reviewChargeReferenceId, request.yar)

  return h.view('bill-runs/review/review-charge-reference.njk', pageData)
}

export async function viewReviewLicence(request, h) {
  const { reviewLicenceId } = request.params

  const pageData = await ViewReviewLicenceService(reviewLicenceId, request.yar)

  return h.view('bill-runs/review/review-licence.njk', pageData)
}
