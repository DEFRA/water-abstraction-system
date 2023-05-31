'use strict'

/**
 * Exports the entire db
 * @module DbExportService
 */

const SchemaExportService = require('../db-export/schema-export.service.js')

/**
 * Calls SchemaExportService giving it a schemaName
 */
async function go () {
  // const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

  // for (const schemaName of schemaNames) {
  //   await SchemaExportService.go(schemaName)
  // }

  await SchemaExportService.go('water')
}

module.exports = {
  go
}
