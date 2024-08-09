'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module FlagSupplementaryBillingService
 */

/**
 * Orchestrates flagging a licence for supplementary billing
 *
 * @param {String} payload - The UUID for the bill run
 */
async function go (payload) {
  console.log('It WORKED!!!!')
  const dataValidation = _validatePayload(payload)
}

function _validatePayload (payload) {
  if (payload.returnId) {
    return true
  } else if (payload.chargeVersionId) {
    return true
  } else {
    return false
  }
}

module.exports = {
  go
}
