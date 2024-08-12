'use strict'

/**
 * Creates the return logs for the next cycle
 * @module CreateReturnLogsService
 */

const FetchReturnLogsService = require('./fetch-return-logs.service.js')
const SubmitReturnLogsService = require('./submit-return-logs.service.js')

/**
 * Creates the return logs for the next cycle
 */
async function go (isSummer, licenceReference) {
  try {
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    console.log(`There are ${returnLogs.length} number of return logs to be created.`)
    console.log(returnLogs[0])

    if (returnLogs.length > 0) {
      await SubmitReturnLogsService.go(returnLogs)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', null, error)
  }
}

module.exports = {
  go
}
