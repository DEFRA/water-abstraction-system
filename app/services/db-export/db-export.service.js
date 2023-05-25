'use strict'

/**
 * Exports the entire db
 * @module DbExportService
 */

const SchemaExportService = require('../db-export/schema-export.service')

/**
 * Calls TableExportsService giving it a tableName and schemaName
 */
async function go () {
  await SchemaExportService.go('water')
}

module.exports = {
  go
}
