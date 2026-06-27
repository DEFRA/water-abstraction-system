'use strict'

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const CheckLicenceExistsDal = require('../../../../app/dal/notices/setup/check-licence-exists.dal.js')

describe('Notices - Setup - Check Licence Exists DAL', () => {
  let licence

  beforeAll(async () => {
    licence = await LicenceHelper.add()
  })

  afterAll(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns true', async () => {
      const result = await CheckLicenceExistsDal.go(licence.licenceRef)

      expect(result).toEqual(true)
    })
  })

  describe('when the licence does not exist', () => {
    it('returns false', async () => {
      const result = await CheckLicenceExistsDal.go('does-not-exist')

      expect(result).toEqual(false)
    })
  })
})
