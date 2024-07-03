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
  // These dates were taken from a real licence where our first iteration was not showing the charge versions in the
  // correct order!
  const startDate = new Date('2018-04-01')
  const endDate = new Date('2030-03-31')

  let currentChargeVersionId
  let supersededChargeVersionId

  describe('when the licence has charge versions data', () => {
    beforeEach(async () => {
      const changeReason = await ChangeReasonHelper.add()

      // Create multiple charge versions to ensure we get them in the right order
      let chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        endDate,
        licenceId,
        scheme: 'alcs',
        startDate,
        status: 'superseded'
      })

      supersededChargeVersionId = chargeVersion.id

      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        licenceId,
        scheme: 'alcs',
        startDate
      })

      currentChargeVersionId = chargeVersion.id
    })

    it('returns the matching charge versions data', async () => {
      const result = await FetchChargeVersionsService.go(licenceId)

      expect(result).to.equal([
        {
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          endDate: null,
          id: currentChargeVersionId,
          licenceId,
          startDate,
          status: 'current'
        },
        {
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          endDate,
          id: supersededChargeVersionId,
          licenceId,
          startDate,
          status: 'superseded'
        }
      ])
    })
  })
})
