'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const CrmSchemaService = require('./crm-schema.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../../app/lib/general.lib.js')
const IdmSchemaService = require('./idm-schema.service.js')
const PermitSchemaService = require('./permit-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')
const WaterSchemaService = require('./water-schema.service.js')

/**
 * Removes all data created for acceptance tests
 *
 * @param {string} licenceRef
 * @param {string} companyName
 * @param {string} userEmail
 */
async function go(licenceRef, companyName, userEmail) {
  const startTime = currentTimeInNanoseconds()

  await Promise.all([
    CrmSchemaService.go(companyName, licenceRef),
    IdmSchemaService.go(userEmail),
    PermitSchemaService.go(),
    ReturnsSchemaService.go()
  ])

  await WaterSchemaService.go(licenceRef)

  calculateAndLogTimeTaken(startTime, 'Tear down complete')
}

module.exports = {
  go
}
