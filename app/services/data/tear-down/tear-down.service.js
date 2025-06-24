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
 */
async function go() {
  const startTime = currentTimeInNanoseconds()

  await Promise.all([CrmSchemaService.go(), IdmSchemaService.go(), PermitSchemaService.go(), ReturnsSchemaService.go()])

  await WaterSchemaService.go()

  calculateAndLogTimeTaken(startTime, 'Tear down complete')
}

module.exports = {
  go
}
