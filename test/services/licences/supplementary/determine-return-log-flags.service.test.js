'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

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
      before(async () => {
        licence = await LicenceHelper.add({ includeInPresrocBilling: 'yes', includeInSrocBilling: true })
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineReturnLogFlagsService.go(returnLog.id)

        expect(result.licenceId).to.equal(licence.id)
        expect(result.regionId).to.equal(licence.regionId)
        expect(result.startDate).to.equal(returnLog.startDate)
        expect(result.endDate).to.equal(returnLog.endDate)
      })

      describe('and the return is not two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and the return is two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        before(async () => {
          returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata: { isTwoPartTariff: true } })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })

      describe('and the return started before the 1st of April 2022 (sroc)', () => {
        before(async () => {
          returnLog = await ReturnLogHelper.add({
            licenceRef: licence.licenceRef,
            startDate: new Date('2021-04-01'),
            endDate: new Date('2022-03-31')
          })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })

    describe('for a licence that is not already flagged for billing', () => {
      before(async () => {
        licence = await LicenceHelper.add()
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
      })

      it('always returns the licenceId, regionId, startDate and endDate', async () => {
        const result = await DetermineReturnLogFlagsService.go(returnLog.id)

        expect(result.licenceId).to.equal(licence.id)
        expect(result.regionId).to.equal(licence.regionId)
        expect(result.startDate).to.equal(returnLog.startDate)
        expect(result.endDate).to.equal(returnLog.endDate)
      })

      describe('and the return is not two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('and the return is two-part tariff, ending after the 1st of April 2022 (sroc)', () => {
        before(async () => {
          returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata: { isTwoPartTariff: true } })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
        })
      })

      describe('and the return started before the 1st of April 2022 (sroc)', () => {
        before(async () => {
          returnLog = await ReturnLogHelper.add({
            licenceRef: licence.licenceRef,
            startDate: new Date('2021-04-01'),
            endDate: new Date('2022-03-31')
          })
        })

        it('returns the correct flags', async () => {
          const result = await DetermineReturnLogFlagsService.go(returnLog.id)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })
  })
})
