'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const LoadService = require('../../../../app/services/data/load/load.service.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')

// Models
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')

// Thing under test
const ReturnsSchemaService = require('../../../../app/services/data/tear-down/returns-schema.service.js')

describe.only('Returns schema service', () => {
  describe('go', () => {
    describe('when return logs have been loaded', () => {
      let licence
      let loadResult

      beforeEach(async () => {
        const testRegion = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)
        const licenceRef = LicenceHelper.generateLicenceRef()

        // The licence anchors the return log's licenceRef to the test region so the licence_ref cascade can find it
        // after is_test is removed. It is cleaned up in afterEach because ReturnsSchemaService does not touch licences.
        licence = await LicenceHelper.add({
          licenceRef,
          regionId: testRegion.id,
          regions: { historicalAreaCode: 'SAAR', regionalChargeArea: testRegion.displayName },
          startDate: '2022-01-01'
        })

        loadResult = await LoadService.go({ returnLogs: [{ licenceRef }] })
      })

      afterEach(async () => {
        await licence.$query().delete()
      })

      it('removes the loaded return logs', async () => {
        await ReturnsSchemaService.go()

        expect(await ReturnLogModel.query().findById(loadResult.returnLogs[0])).to.be.undefined()
      })
    })

    describe('when return cycles have been loaded', () => {
      let returnCycle

      beforeEach(async () => {
        // returnCycles has no is_test column so LoadService cannot be used; seed directly via the helper.
        // Use a future end date so the cycle is caught by the future_cycles mechanism in teardown.
        returnCycle = await ReturnCycleHelper.add({
          id: generateUUID(),
          endDate: new Date('2099-03-31'),
          startDate: new Date('2098-04-01'),
          summer: false
        })
      })

      it('removes the loaded return cycles', async () => {
        await ReturnsSchemaService.go()

        expect(await ReturnCycleModel.query().findById(returnCycle.id)).to.be.undefined()
      })
    })
  })
})
