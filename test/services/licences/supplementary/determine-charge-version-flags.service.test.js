'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DetermineChargeVersionFlagsService = require('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')

describe.only('Determine Charge Version Flags Service', () => {
  describe('when given a valid chargeVersionId', () => {
    let chargeVersion
    let licence

    describe('related to a licence that is already flagged for billing', () => {
      before(async () => {
        licence = await LicenceHelper.add({ includeInPresrocBilling: 'yes', includeInSrocBilling: true })
        chargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId: licence.id })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineChargeVersionFlagsService.go(
          chargeVersion.id,
          licence.id,
          chargeVersion.startDate
        )

        expect(result.licenceId).to.equal(licence.id)
        expect(result.regionId).to.equal(licence.regionId)
        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(null)
      })

      describe('and has a charging schema of "alcs"', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineChargeVersionFlagsService.go(
            chargeVersion.id,
            licence.id,
            chargeVersion.startDate
          )

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and has a charging schema of "sroc"', () => {
        before(async () => {
          chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
        })

        describe('but no two-part tariff indicators', () => {
          it('returns the correct flags', async () => {
            const result = await DetermineChargeVersionFlagsService.go(
              chargeVersion.id,
              licence.id,
              chargeVersion.startDate
            )

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('with two-part tariff indicators', () => {
          before(async () => {
            await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
          })

          it('returns the correct flags', async () => {
            const result = await DetermineChargeVersionFlagsService.go(
              chargeVersion.id,
              licence.id,
              chargeVersion.startDate
            )

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
          })
        })
      })
    })

    describe('related to a licence that is not already flagged for billing', () => {
      before(async () => {
        licence = await LicenceHelper.add()
        chargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId: licence.id })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineChargeVersionFlagsService.go(
          chargeVersion.id,
          licence.id,
          chargeVersion.startDate
        )

        expect(result.licenceId).to.equal(licence.id)
        expect(result.regionId).to.equal(licence.regionId)
        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(null)
      })

      describe('and has a charging schema of "alcs"', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineChargeVersionFlagsService.go(
            chargeVersion.id,
            licence.id,
            chargeVersion.startDate
          )

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and has a charging schema of "sroc"', () => {
        before(async () => {
          chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
        })

        describe('but no two-part tariff indicators', () => {
          it('returns the correct flags', async () => {
            const result = await DetermineChargeVersionFlagsService.go(
              chargeVersion.id,
              licence.id,
              chargeVersion.startDate
            )

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('with two-part tariff indicators', () => {
          before(async () => {
            await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
          })

          it('returns the correct flags', async () => {
            const result = await DetermineChargeVersionFlagsService.go(
              chargeVersion.id,
              licence.id,
              chargeVersion.startDate
            )

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
          })
        })
      })
    })
  })
})
