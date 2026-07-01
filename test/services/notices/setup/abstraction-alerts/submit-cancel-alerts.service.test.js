'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCancelAlertsService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')

describe('Notices - Setup - Abstraction Alerts - Submit Cancel Alerts service', () => {
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

      expect(result).toEqual({ monitoringStationId: sessionData.monitoringStationId })
    })

    it('clears the session', async () => {
      await SubmitCancelAlertsService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).toBe(true)
    })
  })
})
