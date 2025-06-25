'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')

// Thing under test
const FetchRelevantLicenceVersionService = require('../../../../app/services/return-versions/setup/fetch-relevant-licence-version.service.js')

describe('Return Versions - Setup - Fetch Relevant Licence Version service', () => {
  const licenceId = generateUUID()
  const licenceVersions = {}

  let startDate

  before(async () => {
    licenceVersions.firstLicenceVersion = await LicenceVersionHelper.add({
      endDate: new Date('2012-08-12'),
      issue: 100,
      licenceId,
      startDate: new Date('1999-01-01'),
      status: 'superseded'
    })

    licenceVersions.secondLicenceVersion = await LicenceVersionHelper.add({
      endDate: new Date('2019-05-12'),
      issue: 101,
      licenceId,
      startDate: new Date('2012-08-13'),
      status: 'superseded'
    })

    licenceVersions.currentLicence = await LicenceVersionHelper.add({
      issue: 102,
      licenceId,
      startDate: new Date('2019-05-13'),
      status: 'current'
    })
  })

  describe('when the selected start date is before the first licence version starts', () => {
    before(() => {
      startDate = new Date('1998-04-01')
    })

    it('returns the first licence version for the licence', async () => {
      const result = await FetchRelevantLicenceVersionService.go(licenceId, startDate)

      expect(result).to.equal({
        endDate: licenceVersions.firstLicenceVersion.endDate,
        id: licenceVersions.firstLicenceVersion.id,
        startDate: licenceVersions.firstLicenceVersion.startDate
      })
    })
  })

  describe('when the selected start date is after the last licence version ends', () => {
    before(() => {
      startDate = new Date('2024-04-01')
    })

    it('returns the "current" licence version for the licence', async () => {
      const result = await FetchRelevantLicenceVersionService.go(licenceId, startDate)

      expect(result).to.equal({
        endDate: licenceVersions.currentLicence.endDate,
        id: licenceVersions.currentLicence.id,
        startDate: licenceVersions.currentLicence.startDate
      })
    })
  })

  describe('when the selected start date is after the first licence version ends but before the "current" version starts', () => {
    before(() => {
      startDate = new Date('2016-04-01')
    })

    it('returns the "relevant" licence version for the licence', async () => {
      const result = await FetchRelevantLicenceVersionService.go(licenceId, startDate)

      expect(result).to.equal({
        endDate: licenceVersions.secondLicenceVersion.endDate,
        id: licenceVersions.secondLicenceVersion.id,
        startDate: licenceVersions.secondLicenceVersion.startDate
      })
    })
  })

  describe('when the licence ID is unknown', () => {
    before(() => {
      startDate = new Date('2024-04-01')
    })

    it('returns "undefined"', async () => {
      const result = await FetchRelevantLicenceVersionService.go('1d7f6806-43b1-4cce-9ab1-adb28448aef2', startDate)

      expect(result).to.be.undefined()
    })
  })
})
