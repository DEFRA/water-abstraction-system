'use strict'

/**
 * Service for /import/licence
 * @module ImportLicenceHandler
 */

const ImportLicenceService = require('./fetch-licence-from-import.service.js')
const ImportLicenceMapper = require('../import-licence.mapper.js')

async function go (licenceRef) {
  const importLicenceData = await ImportLicenceService.go(licenceRef)

  console.log('Import Licence Data', importLicenceData)

  const transformedData = ImportLicenceMapper.go(importLicenceData)

  console.log('Transformed Licence Data', transformedData)

  // TODO: validate output here

  // TODO: persist data here
}

module.exports = {
  go
}
