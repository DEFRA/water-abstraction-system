'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchLicenceExistsDal = require('../../../app/dal/licences/fetch-licence-exists.dal.js')

describe('DAL - Fetch licence exists dal', () => {
  let licence

  before(async () => {
    licence = await LicenceHelper.add()
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns true', async () => {
      const result = await FetchLicenceExistsDal.go(licence.licenceRef)

      expect(result).to.equal(true)
    })
  })

  describe('when the licence does not exist', () => {
    it('returns false', async () => {
      const result = await FetchLicenceExistsDal.go('does-not-exist')

      expect(result).to.equal(false)
    })
  })
})
