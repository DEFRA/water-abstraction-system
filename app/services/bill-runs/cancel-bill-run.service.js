'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 * @module CancelBillRunConfirmationService
 */

const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

/**
 * Orchestrates fetching and presenting the data needed for the cancel bill run confirmation page
 *
 * @param {string} id The UUID of the bill run to cancel
 *
 * @returns {Object} an object representing the `pageData` needed by the cancel bill run template. It contains details
 * of the bill run.
 */
async function go (id, billRunBatchType) {
  const result = await LegacyRequestLib.post('water', `billing/batch/${id}/cancel`)

  console.log('🚀 ~ go ~ result:', result)
}

module.exports = {
  go
}
