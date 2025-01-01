'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const NoLicencesService = require('../../../../app/services/bill-runs/setup/no-licences.service.js')

describe('Bill Runs - Setup - No Licences service', () => {
  const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  let sessionId

  after(async () => {
    await closeConnection()
  })

  describe('when called with a valid session id', () => {
    beforeEach(async () => {
      const session = await SessionHelper.add({ data: { region: region.id } })

      sessionId = session.id
    })

    it('returns page data for the view', async () => {
      const result = await NoLicencesService.go(sessionId)

      expect(result).to.equal({
        sessionId,
        pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${region.displayName} region`
      })
    })
  })
})
