'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DetermineChargeVersionYearsService = require('../../../../app/services/licences/supplementary/determine-charge-version-years.service.js')

describe('Determine Charge Version Years Service', () => {
  describe('when given a valid chargeVersionId', () => {
    let chargeVersion
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
      chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
    })

    it('always returns the licence, startDate and endDate', async () => {
      const result = await DetermineChargeVersionYearsService.go(chargeVersion.id)

      expect(result.licence).to.equal({ id: licence.id, regionId: licence.regionId })
      expect(result.startDate).to.equal(chargeVersion.startDate)
      expect(result.endDate).to.equal(null)
    })

    describe('that has a charging schema of "sroc"', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
      })

      describe('and a charge reference without two-part tariff indicators', () => {
        it('returns flagForBilling and twoPartTariff as false', async () => {
          const result = await DetermineChargeVersionYearsService.go(chargeVersion.id)

          expect(result.flagForBilling).to.equal(false)
          expect(result.twoPartTariff).to.equal(false)
        })
      })

      describe('and a charge reference with two-part tariff indicators', () => {
        beforeEach(async () => {
          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns flagForBilling and twoPartTariff as true', async () => {
          const result = await DetermineChargeVersionYearsService.go(chargeVersion.id)

          expect(result.flagForBilling).to.equal(true)
          expect(result.twoPartTariff).to.equal(true)
        })
      })
    })

    describe('that has a charging schema of "alcs"', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId: licence.id })
      })

      it('returns flagForBilling and twoPartTariff as false', async () => {
        const result = await DetermineChargeVersionYearsService.go(chargeVersion.id)

        expect(result.flagForBilling).to.equal(false)
        expect(result.twoPartTariff).to.equal(false)
      })
    })
  })
})
