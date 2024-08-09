'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const DatabaseSupport = require('../../support/database.js')

// Thing under test
const DetermineMinimumChargeService = require('../../../app/services/bill-runs/determine-minimum-charge.service.js')

describe('Determine Minimum Charge service', () => {
  const chargePeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  let chargeVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('where the charge version start date is the same as the charge period', () => {
    describe('and the charge version change reason triggers a minimum charge', () => {
      beforeEach(async () => {
        const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

        chargeVersion = await ChargeVersionHelper.add({
          startDate: new Date('2023-04-01'),
          changeReasonId: changeReason.changeReasonId
        })
        chargeVersion.changeReason = changeReason
        chargeVersion.licence = { startDate: new Date('2022-01-01') }
      })

      it('returns true', async () => {
        const result = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

        expect(result).to.be.true()
      })
    })

    describe('and the charge version change reason does not trigger a minimum charge', () => {
      beforeEach(async () => {
        const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: false })

        chargeVersion = await ChargeVersionHelper.add({
          startDate: new Date('2022-05-01'),
          changeReasonId: changeReason.changeReasonId
        })
        chargeVersion.changeReason = changeReason
        chargeVersion.licence = { startDate: new Date('2022-01-01') }
      })

      it('returns false', async () => {
        const result = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

        expect(result).to.be.false()
      })
    })
  })

  describe('where the charge version start date is not the same as the charge period', () => {
    beforeEach(async () => {
      const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      chargeVersion = await ChargeVersionHelper.add({
        startDate: new Date('2022-03-01'),
        changeReasonId: changeReason.changeReasonId
      })
      chargeVersion.changeReason = changeReason
      chargeVersion.licence = { startDate: new Date('2022-01-01') }
    })

    it('returns false', async () => {
      const result = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

      expect(result).to.be.false()
    })
  })
})
