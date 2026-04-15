'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCancelAlertsService = require('../../../../app/services/notices/setup/submit-cancel-alerts.service.js')

describe('Notices - Setup - Submit Cancel Alerts service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { monitoringStationId: generateUUID() }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the monitoring station id', async () => {
      const result = await SubmitCancelAlertsService.go(session.id)

      expect(result).to.equal({ monitoringStationId: sessionData.monitoringStationId })
    })

    it('clears the session', async () => {
      await SubmitCancelAlertsService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })
  })
})
