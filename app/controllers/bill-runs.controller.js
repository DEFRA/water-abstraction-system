'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CancelBillRunService = require('../services/bill-runs/cancel-bill-run.service.js')
const CreateBillRunValidator = require('../validators/create-bill-run.validator.js')
const IndexBillRunsService = require('../services/bill-runs/index-bill-runs.service.js')
const MatchDetailsService = require('../services/bill-runs/two-part-tariff/match-details.service.js')
const ReviewBillRunService = require('../services/bill-runs/two-part-tariff/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/two-part-tariff/review-licence.service.js')
const SendBillRunService = require('../services/bill-runs/send-bill-run.service.js')
const StartBillRunProcessService = require('../services/bill-runs/start-bill-run-process.service.js')
const SubmitCancelBillRunService = require('../services/bill-runs/submit-cancel-bill-run.service.js')
const SubmitSendBillRunService = require('../services/bill-runs/submit-send-bill-run.service.js')
const ViewBillRunService = require('../services/bill-runs/view-bill-run.service.js')

async function cancel (request, h) {
  const { id } = request.params

  const pageData = await CancelBillRunService.go(id)

  return h.view('bill-runs/cancel.njk', {
    pageTitle: "You're about to cancel this bill run",
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

  const pageData = await MatchDetailsService.go(billRunId, licenceId, reviewChargeElementId)

  return h.view('bill-runs/match-details.njk', {
    pageTitle: 'View match details',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function review (request, h) {
  const { id } = request.params
  const pageData = await ReviewBillRunService.go(id, request.payload)

  return h.view('bill-runs/review.njk', {
    pageTitle: 'Review licences',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await ReviewLicenceService.go(billRunId, licenceId, request.payload)

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

async function submitCancel (request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the SubmitCancelBillRunService to update the status of the bill run to
    // `cancel'.
    await SubmitCancelBillRunService.go(id)

    return h.redirect('/billing/batch/list')
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
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
  cancel,
  create,
  index,
  matchDetails,
  review,
  reviewLicence,
  send,
  submitCancel,
  submitSend,
  view
}
