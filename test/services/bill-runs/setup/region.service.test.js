'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchRegionsService = require('../../../../app/services/bill-runs/setup/fetch-regions.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const RegionService = require('../../../../app/services/bill-runs/setup/region.service.js')

describe('Bill Runs - Setup - Region service', () => {
  let session
  let sessionData
  let regions
  let region

  beforeEach(() => {
    regions = RegionHelper.data
    region = RegionHelper.select()

    sessionData = { region: region.id }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(FetchRegionsService, 'go').resolves(regions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RegionService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/type`,
        pageTitle: 'Select the region',
        regions,
        sessionId: session.id,
        selectedRegion: region.id
      })
    })
  })
})
