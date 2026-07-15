// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Thing under test
import DetermineLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-licence-flags.service.js'

describe('Determine Licence Flags Service', () => {
  describe('when passed a licence ID', () => {
    let licence
    let scheme

    describe('for a licence that already has a pre-sroc and sroc flag', () => {
      beforeAll(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, includeInPresrocBilling: 'yes' })
      })

      describe("and a charging scheme of 'sroc'", () => {
        beforeAll(() => {
          scheme = 'sroc'
        })

        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.licenceId).toEqual(licence.id)
          expect(result.regionId).toEqual(licence.regionId)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe("and a charging scheme of 'alcs'", () => {
        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.licenceId).toEqual(licence.id)
          expect(result.regionId).toEqual(licence.regionId)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })

    describe('for a licence with no pre-sroc or sroc flag', () => {
      beforeAll(async () => {
        licence = await LicenceHelper.add()
      })

      describe("and a charging scheme of 'sroc'", () => {
        beforeAll(() => {
          scheme = 'sroc'
        })

        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.licenceId).toEqual(licence.id)
          expect(result.regionId).toEqual(licence.regionId)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).toEqual(false)
          expect(result.flagForSrocSupplementary).toEqual(true)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })

      describe("and a charging scheme of 'alcs'", () => {
        beforeAll(() => {
          scheme = 'alcs'
        })

        it('returns the licence details', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.licenceId).toEqual(licence.id)
          expect(result.regionId).toEqual(licence.regionId)
        })

        it('returns the correct flags', async () => {
          const result = await DetermineLicenceFlagsService(licence.id, scheme)

          expect(result.flagForPreSrocSupplementary).toEqual(true)
          expect(result.flagForSrocSupplementary).toEqual(false)
          expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
        })
      })
    })
  })
})
