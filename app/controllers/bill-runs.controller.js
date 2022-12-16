'use strict'

/**
 * Controller for /bill-runs endpoints
 * @module BillRunsController
 */

const Boom = require('@hapi/boom')

const CreateBillRunValidator = require('../validators/bill-runs/create-bill-run.validator')

const BillingBatchModel = require('../models/billing-batch.model')

async function createBillRun (request, _h) {
  const validatedData = CreateBillRunValidator.go(request.payload)

  if (validatedData.error) {
    return _formattedValidationError(validatedData.error)
  }

  const { type, scheme, region } = validatedData.value

  let billRun

  try {
    billRun = await BillingBatchModel
      .query()
      .insert({
        batchType: type,
        scheme,
        regionId: region,
        fromFinancialYearEnding: 2022,
        toFinancialYearEnding: 2022,
        status: 'ready'
      })
      .returning('*')
  } catch (error) {
    console.log('🚀 ~ file: bill-runs.controller.js:34 ~ createBillRun ~ error', error)
  }

  return {
    id: billRun.billingBatchId,
    region: billRun.regionId,
    scheme: billRun.scheme,
    type: billRun.batchType,
    status: billRun.status
  }
}

// Takes an error from a validator and returns a suitable Boom error
function _formattedValidationError (e) {
  return Boom.badRequest(e.details[0].message)
}

module.exports = {
  createBillRun
}
