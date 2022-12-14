'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../validators/bill-runs/create-bill-run.validator')

async function createBillRun (request, h) {
  try {
    const validatedData = await CreateBillRunValidator.go(request.payload)
    return validatedData
  } catch (error) {
    return _formattedValidationError(error)
  }
}
// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError (e) {
  return Boom.badRequest(e.details[0].message)
}

module.exports = {
  createBillRun
}
