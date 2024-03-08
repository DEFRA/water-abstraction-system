'use strict'

/**
 * Connects with the Legacy APIs to refresh a bill run
 * @module LegacyRefreshBillRunService
 */

const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

async function go (billRunId) {
  const path = `billing/batches/${billRunId}/refresh`

  return LegacyRequestLib.post('water', path)
}

module.exports = {
  go
}
