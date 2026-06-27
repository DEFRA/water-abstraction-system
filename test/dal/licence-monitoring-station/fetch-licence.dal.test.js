'use strict'

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceDal = require('../../../app/dal/licence-monitoring-station/fetch-licence.dal.js')

describe('Licence Monitoring Station - Fetch Licence DAL', () => {
  let licence

  beforeAll(async () => {
    licence = await LicenceHelper.add()
  })

  afterAll(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns the licence with the data needed to determine if it has ended', async () => {
      const result = await FetchLicenceDal.go(licence.licenceRef)

      expect(result).toEqual({
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

      expect(result).toBeUndefined()
    })
  })
})
