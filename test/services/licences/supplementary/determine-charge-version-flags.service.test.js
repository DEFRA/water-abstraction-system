'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchChargeVersionBillingDataService = require('../../../../app/services/licences/supplementary/fetch-charge-version-billing-data.service.js')

// Thing under test
const DetermineChargeVersionFlagsService = require('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')

describe('Determine Charge Version Flags Service', () => {
  describe('when given a valid chargeVersionId', () => {
    let chargeVersionId

    before(() => {
      chargeVersionId = '41187430-6a49-43a8-b12d-35a657dd1048'
    })

    describe('for a change on a pre-sroc charge version', () => {
      describe('related to a licence that has already been flagged for supplementary billing', () => {
        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

          expect(result.licenceId).to.equal()
          expect(result.regionId).to.equal()
          expect(result.startDate).to.equal()
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(false)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe('for a licence that has not been flagged for supplementary billing', () => {
        it('always returns the licenceId, regionId, startDate and endDate', async () => {
          const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

          expect(result.licenceId).to.equal()
          expect(result.regionId).to.equal()
          expect(result.startDate).to.equal()
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })

    describe('for a change on a sroc non two-part tariff charge version', () => {
      describe('related to a licence that has already been flagged for supplementary billing', () => {

      })

      describe('related to a licence that has not been flagged for supplementary billing', () => {
        describe('and has not been previously billed', () => {
          // Think this scenario might be broken
          // Brand new licence gets set up, for 2024. Its not been in previous bill runs but
          // they add a new sroc charge version to it. Needs to be flagged right?
        })
      })
    })

    describe('for a change on a sroc two-part tariff charge version', () => {

    })
  })
})
