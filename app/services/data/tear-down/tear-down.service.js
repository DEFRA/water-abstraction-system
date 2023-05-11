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
  const startTime = process.hrtime.bigint()

  await Promise.all([
    WaterSchemaService.go(),
    CrmSchemaService.go(),
    ReturnsSchemaService.go(),
    PermitSchemaService.go(),
    IdmSchemaService.go()
  ])

  _calculateAndLogTime(startTime)
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg(`Tear down: Time taken to process ${timeTakenMs}ms`)
}

module.exports = {
  go
}
