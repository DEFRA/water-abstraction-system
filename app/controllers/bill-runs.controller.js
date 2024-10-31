'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const AmendBillableReturnsService = require('../services/bill-runs/two-part-tariff/amend-billable-returns.service.js')
const CancelBillRunService = require('../services/bill-runs/cancel-bill-run.service.js')
const GenerateBillRunService = require('../services/bill-runs/two-part-tariff/generate-bill-run.service.js')
const IndexBillRunsService = require('../services/bill-runs/index-bill-runs.service.js')
const RemoveBillRunLicenceService = require('../services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')
const SendBillRunService = require('../services/bill-runs/send-bill-run.service.js')
const SubmitAmendedBillableReturnsService = require('..//services/bill-runs/two-part-tariff/submit-amended-billable-returns.service.js')
const SubmitCancelBillRunService = require('../services/bill-runs/submit-cancel-bill-run.service.js')
const SubmitRemoveBillRunLicenceService = require('../services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')
const SubmitSendBillRunService = require('../services/bill-runs/submit-send-bill-run.service.js')
const ViewBillRunService = require('../services/bill-runs/view-bill-run.service.js')

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

async function index (request, h) {
  const { page } = request.query

  const pageData = await IndexBillRunsService.go(page)

  return h.view('bill-runs/index.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function removeLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await RemoveBillRunLicenceService.go(billRunId, licenceId)

  return h.view('bill-runs/remove-licence.njk', {
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

async function twoPartTariff (request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the GenerateBillRunService to update the status of the bill run to
    // `processing'.
    await GenerateBillRunService.go(id)

    // Redirect to the bill runs page
    return h.redirect('/system/bill-runs')
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
  amendBillableReturns,
  cancel,
  index,
  removeLicence,
  send,
  submitAmendedBillableReturns,
  submitCancel,
  submitRemoveLicence,
  submitSend,
  twoPartTariff,
  view
}
