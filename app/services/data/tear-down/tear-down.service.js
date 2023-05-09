'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const WaterSchemaService = require('./water-schema.service.js')
const CrmSchemaService = require('./crm-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')
const PermitSchemaService = require('./permit-schema.service.js')
const IdmSchemaService = require('./idm-schema.service.js')

async function go () {
  await WaterSchemaService.go()
  await CrmSchemaService.go()
  await ReturnsSchemaService.go()
  await PermitSchemaService.go()
  await IdmSchemaService.go()
}

module.exports = {
  go
}
