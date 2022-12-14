'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const CreateBillRunValidator = require('../validators/bill-runs/create-bill-run.validator')

async function createBillRun (request, h) {
  try {
    const validatedData = await CreateBillRunValidator.go(request.payload)
    return validatedData
  } catch (error) {
    return h.response(error.details[0]).code(400)
  }
}

module.exports = {
  createBillRun
}
