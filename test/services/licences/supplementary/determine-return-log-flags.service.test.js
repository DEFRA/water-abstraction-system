'use strict'

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const DetermineReturnLogFlagsService = require('../../../../app/services/licences/supplementary/determine-return-log-flags.service.js')

describe('Determine Return Log Flags Service', () => {
  describe('when given a returnLogId', () => {
    let returnLog
    let licence

    describe('for a licence that is already flagged for billing', () => {
      beforeAll(async () => {
        licence = await LicenceHelper.add({ includeInPresrocBilling: 'yes', includeInSrocBilling: true })
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineReturnLogFlagsService.go(returnLog.id)

        expect(result.licenceId).toEqual(licence.id)
        expect(result.regionId).toEqual(licence.regionId)
        expect(result.startDate).toEqual(returnLog.startDate)
        expect(result.endDate).toEqual(returnLog.endDate)
      })

      describe('and the return is not two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('and the return is two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        beforeAll(async () => {
          returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata: { isTwoPartTariff: true } })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })

      describe('and the return started before the 1st of April 2022 (sroc)', () => {
        beforeAll(async () => {
          returnLog = await ReturnLogHelper.add({
            licenceRef: licence.licenceRef,
            startDate: new Date('2021-04-01'),
            endDate: new Date('2022-03-31')
          })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })

    describe('for a licence that is not already flagged for billing', () => {
      beforeAll(async () => {
        licence = await LicenceHelper.add()
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineReturnLogFlagsService.go(returnLog.id)

        expect(result.licenceId).toEqual(licence.id)
        expect(result.regionId).toEqual(licence.regionId)
        expect(result.startDate).toEqual(returnLog.startDate)
        expect(result.endDate).toEqual(returnLog.endDate)
      })

      describe('and the return is not two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe('and the return is two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        beforeAll(async () => {
          returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata: { isTwoPartTariff: true } })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
        })
      })

      describe('and the return started before the 1st of April 2022 (sroc)', () => {
        beforeAll(async () => {
          returnLog = await ReturnLogHelper.add({
            licenceRef: licence.licenceRef,
            startDate: new Date('2021-04-01'),
            endDate: new Date('2022-03-31')
          })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })
  })
})
