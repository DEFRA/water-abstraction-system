'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const CrmSchemaService = require('./crm-schema.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../../app/lib/general.lib.js')
const IdmSchemaService = require('./idm-schema.service.js')
const PermitSchemaService = require('./permit-schema.service.js')
const PublicSchemaService = require('./public-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')
const WaterSchemaService = require('./water-schema.service.js')

async function go () {
  const startTime = currentTimeInNanoseconds()

  // The public schema relies on the test region to identify what data to delete. This is therefore deleted first so we
  // don't risk the test region being deleted first
  await PublicSchemaService.go()

  await Promise.all([
    CrmSchemaService.go(),
    IdmSchemaService.go(),
    PermitSchemaService.go(),
    ReturnsSchemaService.go(),
    WaterSchemaService.go()
  ])

  calculateAndLogTimeTaken(startTime, 'Tear down complete')
}

module.exports = {
  go
}
