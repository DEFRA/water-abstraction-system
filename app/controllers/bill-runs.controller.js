'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const AmendAdjustmentFactorService = require('../services/bill-runs/two-part-tariff/amend-adjustment-factor.service.js')
const AmendAuthorisedVolumeService = require('../services/bill-runs/two-part-tariff/amend-authorised-volume.service.js')
const AmendBillableReturnsService = require('../services/bill-runs/two-part-tariff/amend-billable-returns.service.js')
const CalculateCharge = require('../services/bill-runs/two-part-tariff/calculate-charge.service.js')
const CancelBillRunService = require('../services/bill-runs/cancel-bill-run.service.js')
const ChargeReferenceDetailsService = require('../services/bill-runs/two-part-tariff/charge-reference-details.service.js')
const CreateBillRunValidator = require('../validators/create-bill-run.validator.js')
const IndexBillRunsService = require('../services/bill-runs/index-bill-runs.service.js')
const MatchDetailsService = require('../services/bill-runs/two-part-tariff/match-details.service.js')
const RemoveBillRunLicenceService = require('../services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')
const ReviewBillRunService = require('../services/bill-runs/two-part-tariff/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/two-part-tariff/review-licence.service.js')
const SendBillRunService = require('../services/bill-runs/send-bill-run.service.js')
const StartBillRunProcessService = require('../services/bill-runs/start-bill-run-process.service.js')
const SubmitAmendedAdjustmentFactorService = require('../services/bill-runs/two-part-tariff/submit-amended-adjustment-factor.service.js')
const SubmitAmendedAuthorisedVolumeService = require('../services/bill-runs/two-part-tariff/submit-amended-authorised-volume.service.js')
const SubmitAmendedBillableReturnsService = require('..//services/bill-runs/two-part-tariff/submit-amended-billable-returns.service.js')
const SubmitCancelBillRunService = require('../services/bill-runs/submit-cancel-bill-run.service.js')
const SubmitRemoveBillRunLicenceService = require('../services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')
const SubmitReviewBillRunService = require('../services/bill-runs/two-part-tariff/submit-review-bill-run.service.js')
const SubmitReviewLicenceService = require('../services/bill-runs/two-part-tariff/submit-review-licence.service.js')
const SubmitSendBillRunService = require('../services/bill-runs/submit-send-bill-run.service.js')
const ViewBillRunService = require('../services/bill-runs/view-bill-run.service.js')

async function amendAdjustmentFactor (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params

  const pageData = await AmendAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReferenceId)

  return h.view('bill-runs/amend-adjustment-factor.njk', {
    pageTitle: 'Set the adjustment factors',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function amendAuthorisedVolume (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params

  const pageData = await AmendAuthorisedVolumeService.go(billRunId, licenceId, reviewChargeReferenceId)

  return h.view('bill-runs/amend-authorised-volume.njk', {
    pageTitle: 'Set the authorised volume',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function amendBillableReturns (request, h) {
  const { id: billRunId, licenceId, reviewChargeElementId } = request.params

  const pageData = await AmendBillableReturnsService.go(billRunId, licenceId, reviewChargeElementId)

  return h.view('bill-runs/amend-billable-returns.njk', {
    pageTitle: 'Set the billable returns quantity for this bill run',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function cancel (request, h) {
  const { id } = request.params

  const pageData = await CancelBillRunService.go(id)

  return h.view('bill-runs/cancel.njk', {
    pageTitle: "You're about to cancel this bill run",
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function chargeReferenceDetails (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params

  const pageData = await ChargeReferenceDetailsService.go(billRunId, licenceId, reviewChargeReferenceId, request.yar)

  return h.view('bill-runs/charge-reference-details.njk', {
    pageTitle: 'Charge reference details',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function create (request, h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return Boom.badRequest(validatedData.error.details[0].message)
  }

  try {
    const { region, type, user, financialYearEnding } = validatedData.value
    const result = await StartBillRunProcessService.go(region, type, user, financialYearEnding)

    return h.response(result).code(200)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function index (request, h) {
  const { page } = request.query

  const pageData = await IndexBillRunsService.go(page)

  return h.view('bill-runs/index.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function matchDetails (request, h) {
  const { id: billRunId, licenceId, reviewChargeElementId } = request.params

  const pageData = await MatchDetailsService.go(billRunId, licenceId, reviewChargeElementId, request.yar)

  return h.view('bill-runs/match-details.njk', {
    pageTitle: 'View match details',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function previewCharge (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params

  await CalculateCharge.go(licenceId, reviewChargeReferenceId, request.yar)

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}/charge-reference-details/${reviewChargeReferenceId}`)
}

async function removeLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await RemoveBillRunLicenceService.go(billRunId, licenceId)

  return h.view('bill-runs/remove-licence.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function review (request, h) {
  const { id } = request.params
  const { page } = request.query

  const pageData = await ReviewBillRunService.go(id, page, request.yar)

  return h.view('bill-runs/review.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await ReviewLicenceService.go(billRunId, licenceId, request.yar)

  return h.view('bill-runs/review-licence.njk', {
    pageTitle: `Licence ${pageData.licence.licenceRef}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function send (request, h) {
  const { id } = request.params

  const pageData = await SendBillRunService.go(id)

  return h.view('bill-runs/send.njk', {
    pageTitle: "You're about to send this bill run",
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function submitAmendedAdjustmentFactor (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params
  const pageData = await SubmitAmendedAdjustmentFactorService.go(
    billRunId,
    licenceId,
    reviewChargeReferenceId,
    request.payload,
    request.yar
  )

  if (pageData.error) {
    return h.view('bill-runs/amend-adjustment-factor.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}/charge-reference-details/${reviewChargeReferenceId}`)
}

async function submitAmendedAuthorisedVolume (request, h) {
  const { id: billRunId, licenceId, reviewChargeReferenceId } = request.params
  const pageData = await SubmitAmendedAuthorisedVolumeService.go(
    billRunId,
    licenceId,
    reviewChargeReferenceId,
    request.payload,
    request.yar
  )

  if (pageData.error) {
    return h.view('bill-runs/amend-authorised-volume.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}/charge-reference-details/${reviewChargeReferenceId}`)
}

async function submitAmendedBillableReturns (request, h) {
  const { id: billRunId, licenceId, reviewChargeElementId } = request.params

  const pageData = await SubmitAmendedBillableReturnsService.go(
    billRunId,
    licenceId,
    reviewChargeElementId,
    request.payload,
    request.yar
  )

  if (pageData.error) {
    return h.view('bill-runs/amend-billable-returns.njk', pageData)
  }

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}/match-details/${reviewChargeElementId}`)
}

async function submitCancel (request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the SubmitCancelBillRunService to update the status of the bill run to
    // `cancel'.
    await SubmitCancelBillRunService.go(id)

    return h.redirect('/system/bill-runs')
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function submitRemoveLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const allLicencesRemoved = await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, request.yar)

  if (allLicencesRemoved) {
    return h.redirect('/system/bill-runs')
  }

  return h.redirect(`/system/bill-runs/${billRunId}/review`)
}

async function submitReview (request, h) {
  const { id } = request.params

  await SubmitReviewBillRunService.go(id, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/${id}/review`)
}

async function submitReviewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  await SubmitReviewLicenceService.go(billRunId, licenceId, request.payload, request.yar)

  return h.redirect(`/system/bill-runs/${billRunId}/review/${licenceId}`)
}

async function submitSend (request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the SubmitSendBillRunService to update the status of the bill run to
    // `sending'.
    await SubmitSendBillRunService.go(id)

    // Redirect to the legacy processing page
    return h.redirect(`/billing/batch/${id}/processing`)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function view (request, h) {
  const { id } = request.params

  const pageData = await ViewBillRunService.go(id)

  return h.view(pageData.view, {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

module.exports = {
  amendAdjustmentFactor,
  amendAuthorisedVolume,
  amendBillableReturns,
  cancel,
  chargeReferenceDetails,
  create,
  index,
  matchDetails,
  previewCharge,
  removeLicence,
  review,
  reviewLicence,
  send,
  submitAmendedAdjustmentFactor,
  submitAmendedAuthorisedVolume,
  submitAmendedBillableReturns,
  submitCancel,
  submitReview,
  submitRemoveLicence,
  submitReviewLicence,
  submitSend,
  view
}
