'use strict'

/**
 * Exports the entire db
 * @module DbExportService
 */

const TableExportService = require('../db-export/table-export.service.js')

/**
 * Calls TableExportsService giving it a tableName and schemaName
 */
async function go () {
  const tableName = 'billing_charge_categories'
  const schemaName = 'water'

  await TableExportService.go(tableName, schemaName)
}

module.exports = {
  go
}
