'use strict'

/**
 *
 * @module SubmitAmendedBillableReturnsService
 */

/**
 * 
 * @param {*} billRunId 
 * @param {*} licenceId 
 * @param {*} reviewChargeElementId 
 * @param {*} payload 
 */
async function go (billRunId, licenceId, reviewChargeElementId, payload) {
  const validateResult = _validate(payload)

  if (!validateResult) {
    await _persistAmendedBillableReturns()

    return
  }
}

module.exports = {
  go
}
