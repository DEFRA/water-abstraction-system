// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import LicenceModel from '../../../../app/models/licence.model.js'

// Things we need to stub
import * as CreateLicenceSupplementaryYearService from '../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js'

// Thing under test
import PersistSupplementaryBillingFlagsService from '../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js'

describe('Persist Supplementary Billing Flags Service', () => {
  beforeEach(async () => {
    vi.spyOn(CreateLicenceSupplementaryYearService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a licence id', () => {
    let testLicence
    let preSrocFlag
    let srocFlag
    let twoPartTariffFinancialYears

    beforeAll(async () => {
      testLicence = await LicenceHelper.add()
    })

    describe('and supplementary billing flags', () => {
      describe('and two-part tariff financial years', () => {
        beforeAll(() => {
          preSrocFlag = true
          srocFlag = true
          twoPartTariffFinancialYears = [2022, 2023]
        })

        it('persists the flags on the licence', async () => {
          await PersistSupplementaryBillingFlagsService(
            twoPartTariffFinancialYears,
            preSrocFlag,
            srocFlag,
            testLicence.id
          )

          const licence = await LicenceModel.query().findById(testLicence.id)

          expect(licence.id).toEqual(testLicence.id)
          expect(licence.includeInPresrocBilling).toEqual('yes')
          expect(licence.includeInSrocBilling).toEqual(true)
        })

        it('calls `CreateLicenceSupplementaryYearsService` to handle persisting the financial years', async () => {
          await PersistSupplementaryBillingFlagsService(
            twoPartTariffFinancialYears,
            preSrocFlag,
            srocFlag,
            testLicence.id
          )

          expect(CreateLicenceSupplementaryYearService.default).toHaveBeenCalled()
        })
      })

      describe('but no two-part tariff financial years', () => {
        beforeAll(() => {
          preSrocFlag = false
          srocFlag = false
          twoPartTariffFinancialYears = []
        })

        it('persists the flags on the licence', async () => {
          await PersistSupplementaryBillingFlagsService(
            twoPartTariffFinancialYears,
            preSrocFlag,
            srocFlag,
            testLicence.id
          )

          const licence = await LicenceModel.query().findById(testLicence.id)

          expect(licence.id).toEqual(testLicence.id)
          expect(licence.includeInPresrocBilling).toEqual('no')
          expect(licence.includeInSrocBilling).toEqual(false)
        })

        it('does not call `CreateLicenceSupplementaryYearsService`', async () => {
          await PersistSupplementaryBillingFlagsService(
            twoPartTariffFinancialYears,
            preSrocFlag,
            srocFlag,
            testLicence.id
          )

          expect(CreateLicenceSupplementaryYearService.default).not.toHaveBeenCalled()
        })
      })
    })
  })
})
