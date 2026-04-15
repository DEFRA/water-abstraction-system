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
      await SubmitCancelService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    describe('when the journey is for a return', () => {
      it('returns the redirect url', async () => {
        const result = await SubmitCancelService.go(session.id)

        expect(result).to.equal('/system/notices')
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
        const result = await SubmitCancelService.go(session.id)

        expect(result).to.equal('/system/monitoring-stations/123')
      })
    })
  })
})
