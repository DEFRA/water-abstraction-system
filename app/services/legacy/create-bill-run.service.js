'use strict'

/**
 * Connects with the Legacy APIs to refresh a bill run
 * @module LegacyRefreshBillRunService
 */

const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

async function go (batchType, regionId, financialYearEnding, user, summer = false) {
  const { id: userId, username: userEmail } = user

  const path = 'billing/batches'
  const body = {
    batchType,
    financialYearEnding,
    regionId,
    isSummer: summer,
    userEmail
  }

  const result = await LegacyRequestLib.post('water', path, userId, true, body)

  return result
}

module.exports = {
  go
}
