'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')
const LicenceSupplementaryYearModel = require('../../../../app/models/licence-supplementary-year.model.js')

// Thing under test
const FetchLicenceSupplementaryYearsService = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')

describe('Fetch Licence Supplementary Years service', () => {
  const regionId = 'acbfbba3-d5ac-422e-9e48-8683c1797e86'

  let licence
  let twoPartTariff

  before(async () => {
    licence = await LicenceHelper.add({ regionId })
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when provided with data that will return years selected for supplementary billing', () => {
    beforeEach(async () => {
      twoPartTariff = true

      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2023, twoPartTariff: true })
      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2024, twoPartTariff: true })
      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2022, twoPartTariff: true })
    })

    afterEach(async () => {
      await LicenceSupplementaryYearModel.query().delete().where('licenceId', licence.id)
    })

    it('returns an array of the years selected for supplementary billing', async () => {
      const result = await FetchLicenceSupplementaryYearsService.go(regionId, twoPartTariff)

      expect(result).to.equal([{ financialYearEnd: 2024 }, { financialYearEnd: 2023 }, { financialYearEnd: 2022 }])
    })
  })

  describe('when provided with data that will not return any years for supplementary billing', () => {
    beforeEach(async () => {
      twoPartTariff = false

      await LicenceSupplementaryYearHelper.add({ licenceId: licence.id, financialYearEnd: 2022, twoPartTariff: true })
    })

    afterEach(async () => {
      await LicenceSupplementaryYearModel.query().delete().where('licenceId', licence.id)
    })

    it('returns an empty array', async () => {
      const result = await FetchLicenceSupplementaryYearsService.go(regionId, twoPartTariff)

      expect(result).to.equal([])
    })
  })
})
