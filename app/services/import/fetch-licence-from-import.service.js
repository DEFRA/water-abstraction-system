'use strict'

/**
 * Service for /import/licence
 * @module FetchImportLicenceService
 */
const { db } = require('../../../db/db.js')

async function go (licenceRef) {
  const licence = await _getLicenceByRef(licenceRef)

  return {
    licence
  }
}

async function _getLicenceByRef (licenceRef) {
  // TODO: granular select  ?
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
