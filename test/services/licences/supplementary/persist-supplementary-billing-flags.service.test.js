'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')

// Things we need to stub
const CreateLicenceSupplementaryYearService = require('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')

// Thing under test
const PersistSupplementaryBillingFlagsService = require('../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js')

describe('Persist Supplementary Billing Flags Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid licence id', () => {
    let testLicence
    let preSrocFlag
    let srocFlag
    let twoPartTariffFinancialYears

    beforeEach(async () => {
      Sinon.stub(CreateLicenceSupplementaryYearService, 'go').resolves()
    })

    describe('and a pre sroc and sroc flag set to true', () => {
      describe('but no two-part tariff financial years', () => {
        before(async () => {
          testLicence = await LicenceHelper.add()
          preSrocFlag = true
          srocFlag = true
          twoPartTariffFinancialYears = []
        })

        it('persists the flags on the licence', async () => {
          await PersistSupplementaryBillingFlagsService.go(
            twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
          )

          const licence = await LicenceModel.query().findById(testLicence.id)

          expect(licence.id).to.equal(testLicence.id)
          expect(licence.includeInPresrocBilling).to.equal('yes')
          expect(licence.includeInSrocBilling).to.equal(true)
        })

        it('returns without calling CreateLicenceSupplementaryYearsService', async () => {
          await PersistSupplementaryBillingFlagsService.go(
            twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
          )

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.false()
        })
      })
    })

    describe('and pre sroc and sroc flag set to false', () => {
      describe('and some two-part tariff financial years', () => {
        before(async () => {
          testLicence = await LicenceHelper.add()
          preSrocFlag = false
          srocFlag = false
          twoPartTariffFinancialYears = [2022, 2023]
        })

        it('persists the flags on the licence', async () => {
          await PersistSupplementaryBillingFlagsService.go(
            twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
          )

          const licence = await LicenceModel.query().findById(testLicence.id)

          expect(licence.id).to.equal(testLicence.id)
          expect(licence.includeInPresrocBilling).to.equal('no')
          expect(licence.includeInSrocBilling).to.equal(false)
        })

        it('calls the CreateLicenceSupplementaryYearsService to persist the financial years', async () => {
          await PersistSupplementaryBillingFlagsService.go(
            twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
          )

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.true()
        })
      })
    })
  })
})
