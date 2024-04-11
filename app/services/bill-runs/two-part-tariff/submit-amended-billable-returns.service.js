'use strict'

/**
 *
 * @module SubmitAmendedBillableReturnsService
*/

const AmendBillableReturnsService = require('../../../services/bill-runs/two-part-tariff/amend-billable-returns.service.js')
const BillableReturnsValidator = require('../../../validators/bill-runs/two-part-tariff/billable-returns.validator.js')

/**
 *
 * @param {*} billRunId 
 * @param {*} licenceId 
 * @param {*} reviewChargeElementId 
 * @param {*} payload 
 */
async function go (billRunId, licenceId, reviewChargeElementId, payload) {
  console.log('Payload: ', payload)
  const validationResult = await _validate(payload)

  console.log('AHHHH :', validationResult)
  if (validationResult === null) {
    console.log('Returning from null')
    return { error: null }
  }

  const pageData = await AmendBillableReturnsService.go(billRunId, licenceId, reviewChargeElementId)
  console.log('Returning page data')
  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _validate (payload) {
  const validation = BillableReturnsValidator.go(payload)

  if (!validation.error) {
    await _persistAmendedBillableReturns()
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

async function _persistAmendedBillableReturns () {
}

module.exports = {
  go
}
