'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../support/helpers/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')

// Thing under test
const DetermineMinimumChargeService = require('../../../app/services/bill-runs/determine-minimum-charge.service.js')

const CHANGE_REASON_CHARGE_CANCELLED_INDEX = 7
const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10

describe('Determine Minimum Charge service', () => {
  const chargePeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }

  let minimumChargeChangeReason
  let noMinimumChargeChangeReason
  let chargeVersion

  before(() => {
    minimumChargeChangeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)
    noMinimumChargeChangeReason = ChangeReasonHelper.select(CHANGE_REASON_CHARGE_CANCELLED_INDEX)
  })

  describe('where the charge version start date is the same as the charge period', () => {
    describe('and the charge version change reason triggers a minimum charge', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({
          startDate: new Date('2023-04-01'),
          changeReasonId: minimumChargeChangeReason.id
        })
        chargeVersion.changeReason = minimumChargeChangeReason
        chargeVersion.licence = { startDate: new Date('2022-01-01') }
      })

      it('returns true', async () => {
        const result = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

        expect(result).to.be.true()
      })
    })

    describe('and the charge version change reason does not trigger a minimum charge', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({
          startDate: new Date('2022-05-01'),
          changeReasonId: noMinimumChargeChangeReason.id
        })
        chargeVersion.changeReason = noMinimumChargeChangeReason
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
      chargeVersion = await ChargeVersionHelper.add({
        startDate: new Date('2022-03-01'),
        changeReasonId: minimumChargeChangeReason.id
      })
      chargeVersion.changeReason = minimumChargeChangeReason
      chargeVersion.licence = { startDate: new Date('2022-01-01') }
    })

    it('returns false', async () => {
      const result = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

      expect(result).to.be.false()
    })
  })
})
