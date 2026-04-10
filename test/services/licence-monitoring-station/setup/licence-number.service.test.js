'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const LicenceNumberService = require('../../../../app/services/licence-monitoring-station/setup/licence-number.service.js')

describe('Licence Monitoring Station Setup - Licence Number Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      label: 'MONITORING_STATION_LABEL',
      licenceRef: 'LICENCE_REF',
      checkPageVisited: false
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceNumberService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        licenceRef: 'LICENCE_REF',
        monitoringStationLabel: 'MONITORING_STATION_LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })
})
