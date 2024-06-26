'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChangeReasonHelper = require('../../support/helpers/change-reason.helper.js')

// Thing under test
const FetchChargeVersionsService =
  require('../../../app/services/licences/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has charge versions data', () => {
    beforeEach(async () => {
      const changeReason = await ChangeReasonHelper.add()

      testRecord = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id
      })
    })

    it('returns the matching charge versions data', async () => {
      const result = await FetchChargeVersionsService.go(testRecord.licenceId)

      expect(result).to.equal([
        {
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          endDate: null,
          id: testRecord.id,
          licenceId: testRecord.licenceId,
          startDate: testRecord.startDate,
          status: 'current'
        }
      ])
    })
  })
})
