'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../../validators/bill-runs/create-bill-run.validator.js')
const InitiateBillingBatchService = require('../../services/supplementary-billing/initiate-billing-batch.service.js')

async function create (request, h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  const result = await InitiateBillingBatchService.go(validatedData.value)

  return h.response(result).code(200)
}

/**
 * Takes an error from a validator and returns a suitable Boom error
*/
function _formattedValidationError (error) {
  return Boom.badRequest(error.details[0].message)
}

module.exports = {
  create
}
