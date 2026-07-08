/**
 * Exports the entire db
 * @module DbExportService
 */

import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'
import SchemaExportService from './schema-export.service.js'

/**
 * Calls SchemaExportService giving it a schemaName
 */
export default async function go() {
  // Mark the start time for later logging
  const startTime = currentTimeInNanoseconds()

  const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

  for (const schemaName of schemaNames) {
    await SchemaExportService(schemaName)
  }

  // Log how long the process took
  calculateAndLogTimeTaken(startTime, 'DB export complete')
}
