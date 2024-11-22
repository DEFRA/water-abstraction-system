'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DetermineLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-licence-flags.service.js')

describe('Determine Licence Flags Service', () => {
  describe('when passed a licence ID', () => {
    let licence
    let scheme

    describe('for a licence that already has a pre-sroc and sroc flag', () => {
      before(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, includeInPresrocBilling: 'yes' })
      })

      describe("and a charging scheme of 'sroc'", () => {
        before(() => {
          scheme = 'sroc'
        })

        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.licenceId).to.equal(licence.id)
          expect(result.regionId).to.equal(licence.regionId)
          expect(result.startDate).to.equal(null)
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe("and a charging scheme of 'alcs'", () => {
        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.licenceId).to.equal(licence.id)
          expect(result.regionId).to.equal(licence.regionId)
          expect(result.startDate).to.equal(null)
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).to.equal(true)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })

    describe('for a licence with no pre-sroc or sroc flag', () => {
      before(async () => {
        licence = await LicenceHelper.add()
      })

      describe("and a charging scheme of 'sroc'", () => {
        before(() => {
          scheme = 'sroc'
        })

        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.licenceId).to.equal(licence.id)
          expect(result.regionId).to.equal(licence.regionId)
          expect(result.startDate).to.equal(null)
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })

      describe("and a charging scheme of 'alcs'", () => {
        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.licenceId).to.equal(licence.id)
          expect(result.regionId).to.equal(licence.regionId)
          expect(result.startDate).to.equal(null)
          expect(result.endDate).to.equal(null)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService.go(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).to.equal(false)
          expect(result.flagForSrocSupplementary).to.equal(true)
          expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
        })
      })
    })
  })
})
