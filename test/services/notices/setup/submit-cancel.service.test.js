'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCancelService = require('../../../../app/services/notices/setup/submit-cancel.service.js')

describe('Notices - Setup - Submit Cancel service', () => {
  let fetchSessionStub
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { licenceRef: '01/111', referenceCode: 'RNIV-1234' }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(DeleteSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).toBe(true)
    })

    describe('when the journey is for a return', () => {
      it('returns the redirect url', async () => {
        const result = await SubmitCancelService(session.id)

        expect(result).toEqual('/system/notices')
      })
    })

    describe('when the journey is for "alerts"', () => {
      beforeEach(() => {
        sessionData = {
          alertType: 'stop',
          journey: 'alerts',
          monitoringStationId: '123',
          referenceCode: 'WAA-1234'
        }
        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns the redirect url', async () => {
        const result = await SubmitCancelService(session.id)

        expect(result).toEqual('/system/monitoring-stations/123')
      })
    })
  })
})
