'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const CrmSchemaService = require('./crm-schema.service.js')
const { currentTimeInNanoseconds } = require('../../../../app/lib/general.lib.js')
const IdmSchemaService = require('./idm-schema.service.js')
const PermitSchemaService = require('./permit-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')
const WaterSchemaService = require('./water-schema.service.js')

async function go () {
  const startTime = currentTimeInNanoseconds()

  await Promise.all([
    CrmSchemaService.go(),
    IdmSchemaService.go(),
    PermitSchemaService.go(),
    ReturnsSchemaService.go(),
    WaterSchemaService.go()
  ])

  _calculateAndLogTime(startTime)
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Tear down complete', { timeTakenMs })
}

module.exports = {
  go
}
