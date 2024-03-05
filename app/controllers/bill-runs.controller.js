'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CancelBillRunService = require('../services/bill-runs/cancel-bill-run.service.js')
const CreateBillRunValidator = require('../validators/create-bill-run.validator.js')
const ReviewBillRunService = require('../services/bill-runs/two-part-tariff/review-bill-run.service.js')
const ReviewLicenceService = require('../services/bill-runs/two-part-tariff/review-licence.service.js')
const StartBillRunProcessService = require('../services/bill-runs/start-bill-run-process.service.js')
const SubmitCancelBillRunService = require('../services/bill-runs/submit-cancel-bill-run.service.js')
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

async function review (request, h) {
  const { id } = request.params

  const pageData = await ReviewBillRunService.go(id)

  return h.view('bill-runs/review.njk', {
    pageTitle: 'Review licences',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function reviewLicence (request, h) {
  const { id: billRunId, licenceId } = request.params

  const pageData = await ReviewLicenceService.go(billRunId, licenceId)

  return h.view('bill-runs/review-licence.njk', {
    pageTitle: 'Licence Review Page',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function submitCancel (request, h) {
  const { id } = request.params

  try {
    // NOTE: What we are awaiting here is for the SubmitCancelBillRunService to update the status of the bill run to
    // `cancel'. If the bill run run is deemed small enough, we'll also wait for the cancelling to complete before
    // we redirect. This avoids users always having to refresh the bill runs page to get rid of bill runs that have
    // finished cancelling 1 second after the request is submitted.
    //
    // But for larger bill runs, especially annual, after the bill run status has been updated control will be returned
    // to here and the cancel process will then happen in the background. Because of this if we didn't wrap the call
    // in a try/catch and the process errored, we'd get an unhandled exception which will bring the service down!
    await SubmitCancelBillRunService.go(id)

    return h.redirect('/billing/batch/list')
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
  review,
  reviewLicence,
  submitCancel,
  view
}
