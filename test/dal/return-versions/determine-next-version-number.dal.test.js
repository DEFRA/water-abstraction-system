'use strict'

// Test helpers
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const DetermineNextVersionNumberDal = require('../../../app/dal/return-versions/determine-next-version-number.dal.js')

describe('DAL - Return Versions - Determine Next Version Number dal', () => {
  let licenceId
  let returnVersions

  beforeAll(() => {
    licenceId = generateUUID()

    returnVersions = []
  })

  afterAll(async () => {
    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }
  })

  describe('when no return versions exist for the licence', () => {
    it('returns "1" as the next version number', async () => {
      const result = await DetermineNextVersionNumberDal.go(licenceId)

      expect(result).toEqual(1)
    })
  })

  describe('when return versions exist for the licence', () => {
    beforeAll(async () => {
      returnVersions = [
        await ReturnVersionHelper.add({ licenceId, version: 1 }),
        await ReturnVersionHelper.add({ licenceId, version: 2 })
      ]
    })

    it('returns the next version number', async () => {
      const result = await DetermineNextVersionNumberDal.go(licenceId)

      expect(result).toEqual(3)
    })
  })
})
