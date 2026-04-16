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
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const NoLicencesService = require('../../../../app/services/bill-runs/setup/no-licences.service.js')

describe('Bill Runs - Setup - No Licences service', () => {
  const region = RegionHelper.select(RegionHelper.TEST_REGION_INDEX)

  let session
  let sessionData

  describe('when called with a valid session id', () => {
    beforeEach(() => {
      sessionData = { region: region.id }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('returns page data for the view', async () => {
      const result = await NoLicencesService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/region`,
        pageTitle: `There are no licences marked for two-part tariff supplementary billing in the ${region.displayName} region`,
        sessionId: session.id
      })
    })
  })
})
