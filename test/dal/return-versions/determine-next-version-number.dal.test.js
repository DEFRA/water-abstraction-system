'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const DetermineNextVersionNumberDal = require('../../../app/dal/return-versions/determine-next-version-number.dal.js')

describe('DAL - Return Versions - Determine Next Version Number dal', () => {
  let licenceId
  let returnVersions

  before(() => {
    licenceId = generateUUID()

    returnVersions = []
  })

  after(async () => {
    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }
  })

  describe('when no return versions exist for the licence', () => {
    it('returns "1" as the next version number', async () => {
      const result = await DetermineNextVersionNumberDal.go(licenceId)

      expect(result).to.equal(1)
    })
  })

  describe('when return versions exist for the licence', () => {
    before(async () => {
      returnVersions = [
        await ReturnVersionHelper.add({ licenceId, version: 1 }),
        await ReturnVersionHelper.add({ licenceId, version: 2 })
      ]
    })

    it('returns the next version number', async () => {
      const result = await DetermineNextVersionNumberDal.go(licenceId)

      expect(result).to.equal(3)
    })
  })
})
