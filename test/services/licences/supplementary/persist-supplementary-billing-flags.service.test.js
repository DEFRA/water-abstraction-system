'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')

// Things we need to stub
const CreateLicenceSupplementaryYearService = require('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')

// Thing under test
const PersistSupplementaryBillingFlagsService = require('../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js')

describe('Persist Supplementary Billing Flags Service', () => {
  beforeEach(async () => {
    Sinon.stub(CreateLicenceSupplementaryYearService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
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

          expect(CreateLicenceSupplementaryYearService.go.called).toBe(true)
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

          expect(CreateLicenceSupplementaryYearService.go.called).toBe(false)
        })
      })
    })
  })
})
