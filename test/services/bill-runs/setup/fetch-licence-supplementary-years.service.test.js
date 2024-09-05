'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')

// Thing under test
const LicenceSupplementaryYearModel = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')

describe('Fetch Licence Supplementary Years service', () => {
  let regionId
  let twoPartTariff

  describe('when provided with data that will return years selected for supplementary billing', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      regionId = licence.regionId
      twoPartTariff = true

      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2023, twoPartTariff: true })
      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2024, twoPartTariff: true })
      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2022, twoPartTariff: true })
    })

    it('returns an array of the years selected for supplementary billing', async () => {
      const result = await LicenceSupplementaryYearModel.go(regionId, twoPartTariff)

      expect(result).to.equal([{ financialYearEnd: 2024 }, { financialYearEnd: 2023 }, { financialYearEnd: 2022 }])
    })
  })

  describe('when provided with data that will not return any years for supplementary billing', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      regionId = licence.regionId
      twoPartTariff = false

      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2022, twoPartTariff: true })
    })

    it('returns an empty array', async () => {
      const result = await LicenceSupplementaryYearModel.go(regionId, twoPartTariff)

      expect(result).to.equal([])
    })
  })
})
