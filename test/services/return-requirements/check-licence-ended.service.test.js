'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const CheckLicenceEndedService = require('../../../app/services/return-requirements/check-licence-ended.service.js')

describe('Return Requirements - CheckLicenceEndedService', () => {
  let licence

  describe('go', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('fetches licence data correctly', async () => {
      const result = await CheckLicenceEndedService.go(licence.id)

      expect(result).to.be.false()
    })
  })
})
