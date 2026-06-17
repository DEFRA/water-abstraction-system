'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceDal = require('../../../app/dal/licence-monitoring-station/fetch-licence.dal.js')

describe('Licence Monitoring Station - Fetch Licence DAL', () => {
  let licence

  before(async () => {
    licence = await LicenceHelper.add()
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns the licence with the data needed to determine if it has ended', async () => {
      const result = await FetchLicenceDal.go(licence.licenceRef)

      expect(result).to.equal({
        expiredDate: null,
        id: licence.id,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        revokedDate: null
      })
    })
  })

  describe('when the licence does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceDal.go(generateUUID())

      expect(result).to.be.undefined()
    })
  })
})
