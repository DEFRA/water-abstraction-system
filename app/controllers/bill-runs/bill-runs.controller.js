'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../../validators/bill-runs/create-bill-run.validator.js')
const ProcessBillingBatchService = require('../../services/supplementary-billing/process-billing-batch.service.js')

async function create (request, h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  try {
    const { region, user } = validatedData.value
    const result = await ProcessBillingBatchService.go(region, user)

    return h.response(result).code(200)
  } catch (error) {
    return _formattedInitiateBillingBatchError(error)
  }
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
function _formattedInitiateBillingBatchError (error) {
  return Boom.badImplementation(error.message)
}

module.exports = {
  create
}
