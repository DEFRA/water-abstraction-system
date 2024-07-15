'use strict'

/**
 * Service for /import/licence
 * @module FetchLegacyImportLicenceService
 */
const { db } = require('../../../../db/db.js')

async function go (licenceRef) {
  return _getLicenceByRef(licenceRef)
}

async function _getLicenceByRef (licenceRef) {
  // TODO: granular select  ? map data to simplify if needs be
  const query = `
      SELECT *
      FROM import."NALD_ABS_LICENCES" l
      WHERE l."LIC_NO" = '${licenceRef}';
  `

  const { rows: [row] } = await db.raw(query)

  return row
}

module.exports = {
  go
}
