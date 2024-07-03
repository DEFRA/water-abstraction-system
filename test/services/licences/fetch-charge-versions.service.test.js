'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChangeReasonHelper = require('../../support/helpers/change-reason.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchChargeVersionsService =
  require('../../../app/services/licences/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  const licenceId = generateUUID()
  const startDate = new Date('2022-04-01')

  let testRecordId

  describe('when the licence has charge versions data', () => {
    beforeEach(async () => {
      const changeReason = await ChangeReasonHelper.add()

      const chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        licenceId,
        startDate
      })

      testRecordId = chargeVersion.id
    })

    it('returns the matching charge versions data', async () => {
      const result = await FetchChargeVersionsService.go(licenceId)

      expect(result).to.equal([
        {
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          endDate: null,
          id: testRecordId,
          licenceId,
          startDate,
          status: 'current'
        }
      ])
    })
  })
})
