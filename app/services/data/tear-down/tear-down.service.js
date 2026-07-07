/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

import CrmSchemaService from './crm-schema.service.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../../app/lib/general.lib.js'
import IdmSchemaService from './idm-schema.service.js'
import PermitSchemaService from './permit-schema.service.js'
import ReturnsSchemaService from './returns-schema.service.js'
import WaterSchemaService from './water-schema.service.js'

/**
 * Removes all data created for acceptance tests
 */
async function go() {
  const startTime = currentTimeInNanoseconds()

  await Promise.all([CrmSchemaService.go(), IdmSchemaService.go(), PermitSchemaService.go(), ReturnsSchemaService.go()])

  await WaterSchemaService.go()

  calculateAndLogTimeTaken(startTime, 'Tear down complete')
}

export {
  go
}
export default {
  go
}
