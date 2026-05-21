'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchRenewalLicenceDal = require('../../../../app/dal/notices/setup/fetch-renewal-licence.dal.js')

describe('Notices - Setup - Fetch Renewal Licence DAL', () => {
  let licence

  before(async () => {
    licence = await LicenceHelper.add()
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns the licence with the renewal date fields', async () => {
      const result = await FetchRenewalLicenceDal.go(licence.licenceRef)

      expect(result).to.equal({
        expiredDate: null,
        id: result.id,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        revokedDate: null
      })
    })
  })

  describe('when the licence does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchRenewalLicenceDal.go('does-not-exist')

      expect(result).to.equal(undefined)
    })
  })
})
