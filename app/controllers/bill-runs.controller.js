'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const IndexBillRunsService = require('../services/bill-runs/index-bill-runs.service.js')
const SubmitCancelBillRunService = require('../services/bill-runs/cancel/submit-cancel-bill-run.service.js')
const SubmitSendBillRunService = require('../services/bill-runs/send/submit-send-bill-run.service.js')
const TwoPartTariffSupplementaryGenerateBillRunService = require('../services/bill-runs/tpt-supplementary/generate-bill-run.service.js')
const TwoPartTariffAnnualGenerateBillRunService = require('../services/bill-runs/two-part-tariff/generate-bill-run.service.js')
const ViewBillRunService = require('../services/bill-runs/view-bill-run.service.js')
const ViewCancelBillRunService = require('../services/bill-runs/cancel/view-cancel-bill-run.service.js')
const ViewSendBillRunService = require('../services/bill-runs/send/view-send-bill-run.service.js')

async function cancel(request, h) {
  const { id } = request.params

  const pageData = await ViewCancelBillRunService.go(id)

  return h.view('bill-runs/cancel.njk', pageData)
}

async function index(request, h) {
  const { page } = request.query

  const pageData = await IndexBillRunsService.go(page)

  return h.view('bill-runs/index.njk', pageData)
}

async function send(request, h) {
  const { id } = request.params

  const pageData = await ViewSendBillRunService.go(id)

  return h.view('bill-runs/send.njk', pageData)
}

async function submitCancel(request, h) {
  const { id } = request.params

  // NOTE: What we are awaiting here is for the SubmitCancelBillRunService to update the status of the bill run to
  // `cancel'. Deleting the bill run will carry on in the background after that
  await SubmitCancelBillRunService.go(id)

  return h.redirect('/system/bill-runs')
}

async function submitSend(request, h) {
  const { id } = request.params

  // NOTE: What we are awaiting here is for the SubmitSendBillRunService to update the status of the bill run to
  // `sending'.
  await SubmitSendBillRunService.go(id)

  // Redirect to the legacy processing page
  return h.redirect(`/billing/batch/${id}/processing`)
}

async function tptSupplementary(request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the GenerateBillRunService to update the status of the bill run to
    // `processing'.
    await TwoPartTariffSupplementaryGenerateBillRunService.go(id)

    // Redirect to the bill runs page
    return h.redirect('/system/bill-runs')
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function twoPartTariff(request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the GenerateBillRunService to update the status of the bill run to
    // `processing'.
    await TwoPartTariffAnnualGenerateBillRunService.go(id)

    // Redirect to the bill runs page
    return h.redirect('/system/bill-runs')
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewBillRunService.go(id)

  return h.view(pageData.view, pageData)
}

module.exports = {
  cancel,
  index,
  send,
  submitCancel,
  submitSend,
  tptSupplementary,
  twoPartTariff,
  view
}
