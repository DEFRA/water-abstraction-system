'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../validators/bill-runs/create-bill-run.validator')

async function createBillRun (request, _h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  return {
    id: 'DUMMY_SROC_BATCH',
    region: validatedData.value.region,
    scheme: validatedData.value.scheme,
    type: validatedData.value.type,
    status: 'ready'
  }
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError (e) {
  return Boom.badRequest(e.details[0].message)
}

module.exports = {
  createBillRun
}
