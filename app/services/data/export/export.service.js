'use strict'

/**
 * Exports the entire db
 * @module DbExportService
 */

const SchemaExportService = require('./schema-export.service.js')

/**
 * Calls SchemaExportService giving it a schemaName
 */
async function go () {
  // Mark the start time for later logging
  const startTime = process.hrtime.bigint()

  const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

  for (const schemaName of schemaNames) {
    console.log('Exporting schema :', schemaName)
    await SchemaExportService.go(schemaName)
  }

  // Log how long the process took
  _calculateAndLogTime(startTime)
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('DB export complete', { timeTakenMs })
}

module.exports = {
  go
}
