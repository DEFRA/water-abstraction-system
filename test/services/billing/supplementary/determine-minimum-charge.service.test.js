'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeInformationHelper = require('../../../support/helpers/water/charge-information.helper.js')
const ChangeReasonHelper = require('../../../support/helpers/water/change-reason.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Thing under test
const DetermineMinimumChargeService = require('../../../../app/services/billing/supplementary/determine-minimum-charge.service.js')

describe('Determine Minimum Charge service', () => {
  const chargePeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  let chargeInformation

  afterEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('where the charge information start date is the same as the charge period', () => {
    describe('and the charge information change reason triggers a minimum charge', () => {
      beforeEach(async () => {
        const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })
        chargeInformation = await ChargeInformationHelper.add({
          startDate: new Date('2023-04-01'),
          changeReasonId: changeReason.changeReasonId
        })
        chargeInformation.changeReason = changeReason
        chargeInformation.licence = { startDate: new Date('2022-01-01') }
      })

      it('returns true', async () => {
        const result = DetermineMinimumChargeService.go(chargeInformation, chargePeriod)

        expect(result).to.be.true()
      })
    })

    describe('and the charge information change reason does not trigger a minimum charge', () => {
      beforeEach(async () => {
        const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: false })
        chargeInformation = await ChargeInformationHelper.add({
          startDate: new Date('2022-05-01'),
          changeReasonId: changeReason.changeReasonId
        })
        chargeInformation.changeReason = changeReason
        chargeInformation.licence = { startDate: new Date('2022-01-01') }
      })

      it('returns false', async () => {
        const result = DetermineMinimumChargeService.go(chargeInformation, chargePeriod)

        expect(result).to.be.false()
      })
    })
  })

  describe('where the charge information start date is not the same as the charge period', () => {
    beforeEach(async () => {
      const changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })
      chargeInformation = await ChargeInformationHelper.add({
        startDate: new Date('2022-03-01'),
        changeReasonId: changeReason.changeReasonId
      })
      chargeInformation.changeReason = changeReason
      chargeInformation.licence = { startDate: new Date('2022-01-01') }
    })

    it('returns false', async () => {
      const result = DetermineMinimumChargeService.go(chargeInformation, chargePeriod)

      expect(result).to.be.false()
    })
  })
})
