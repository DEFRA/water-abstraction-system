'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../validators/bill-runs/create-bill-run.validator')

async function createBillRun (request, h) {
  const result = CreateBillRunValidator.go(request.payload)

  if (result.error) {
    return _formattedValidationError(result.error)
  }

  return result.value
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError (e) {
  return Boom.badRequest(e.details[0].message)
}

module.exports = {
  createBillRun
}
