'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const NoLicencesService = require('../../../../app/services/bill-runs/setup/no-licences.service.js')

describe('Bill Runs - Setup - No Licences service', () => {
  let sessionId

  describe('when called with a valid session id', () => {
    beforeEach(async () => {
      const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)
      const session = await SessionHelper.add({ data: { region: region.id } })

      sessionId = session.id
    })

    it('returns the regions display name', async () => {
      const result = await NoLicencesService.go(sessionId)

      expect(result).to.equal('Test Region')
    })
  })
})
