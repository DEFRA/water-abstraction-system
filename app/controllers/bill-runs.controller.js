'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../validators/create-bill-run.validator.js')
const StartBillRunProcessService = require('../services/bill-runs/start-bill-run-process.service.js')
const ViewBillRunService = require('../services/bill-runs/view-bill-run.service.js')
const View2ptSrocBillService = require('../services/bill-runs/two-part-tariff/view-2pt-sroc-bill.service.js')

async function create (request, h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  try {
    const { region, type, user, financialYearEnding } = validatedData.value
    const result = await StartBillRunProcessService.go(region, type, user, financialYearEnding)

    return h.response(result).code(200)
  } catch (error) {
    return _formattedInitiateBillRunError(error)
  }
}

async function review (request, h) {
  const { id } = request.params

  const pageData = await View2ptSrocBillService.go(id)
  console.log('Page Data :', pageData)
  return h.view('bill-runs/review.njk', {
    pageTitle: 'Review Two Part Tariff SROC',
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function view (request, h) {
  const { id } = request.params

  const pageData = await ViewBillRunService.go(id)

  return h.view('bill-runs/view.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

/**
 * Takes an error from a validator and returns a suitable Boom error
*/
function _formattedValidationError (error) {
  return Boom.badRequest(error.details[0].message)
}

/**
 * Takes an error thrown during operation and returns a suitable Boom error
 */
function _formattedInitiateBillRunError (error) {
  return Boom.badImplementation(error.message)
}

module.exports = {
  create,
  review,
  view
}
