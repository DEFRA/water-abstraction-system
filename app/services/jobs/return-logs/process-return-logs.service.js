'use strict'

/**
 * Creates the return logs for the next cycle
 * @module CreateReturnLogsService
 */

const FetchReturnLogsService = require('./fetch-return-logs.service.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')

/**
 * Creates the return logs for the next cycle
 */
async function go (isSummer, licenceReference) {
  try {
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    if (returnLogs.length > 0) {
      await CreateReturnLogsService.go(returnLogs)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', null, error)
  }
}

module.exports = {
  go
}
