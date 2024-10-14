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
  let preSrocFlag
  let srocFlag
  let testLicence
  let twoPartTariffFinancialYears

  beforeEach(async () => {
    Sinon.stub(CreateLicenceSupplementaryYearService, 'go').resolves()
    testLicence = await LicenceHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the imported licence should be flagged for pre sroc supplementary billing', () => {
    before(() => {
      preSrocFlag = true
      srocFlag = false
      twoPartTariffFinancialYears = []
    })

    it('persists the pre sroc supplementary billing flag on the licence', async () => {
      await PersistSupplementaryBillingFlagsService.go(
        twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
      )

      const licence = await LicenceModel.query().findById(testLicence.id)

      expect(licence.id).to.equal(testLicence.id)
      expect(licence.includeInPresrocBilling).to.equal('yes')
      expect(licence.includeInSrocBilling).to.equal(false)
    })
  })

  describe('when the imported licence should be flagged for sroc supplementary billing', () => {
    before(() => {
      preSrocFlag = false
      srocFlag = true
      twoPartTariffFinancialYears = []
    })

    it('persists the sroc supplementary billing flag on the licence', async () => {
      await PersistSupplementaryBillingFlagsService.go(
        twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
      )

      const licence = await LicenceModel.query().findById(testLicence.id)

      expect(licence.id).to.equal(testLicence.id)
      expect(licence.includeInPresrocBilling).to.equal('no')
      expect(licence.includeInSrocBilling).to.equal(true)
    })
  })

  describe('when the imported licence should be flagged for two-part tariff sroc supplementary billing', () => {
    before(() => {
      preSrocFlag = false
      srocFlag = false
      twoPartTariffFinancialYears = [2022, 2023]
    })

    it('calls CreateLicenceSupplementaryYearsService to handle persisting the two-part tariff years', async () => {
      await PersistSupplementaryBillingFlagsService.go(
        twoPartTariffFinancialYears, preSrocFlag, srocFlag, testLicence.id
      )

      expect(CreateLicenceSupplementaryYearService.go.called).to.be.true()
    })
  })
})
