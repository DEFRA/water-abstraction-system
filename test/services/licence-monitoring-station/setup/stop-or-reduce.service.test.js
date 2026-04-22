'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const StopOrReduceService = require('../../../../app/services/licence-monitoring-station/setup/stop-or-reduce.service.js')

describe('Licence Monitoring Station Setup - Stop Or Reduce service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869',
      label: 'Monitoring Station Label'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await StopOrReduceService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await StopOrReduceService.go(session.id)

      expect(result).to.equal(
        {
          backLink: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
          monitoringStationLabel: 'Monitoring Station Label',
          pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
          stopOrReduce: null,
          reduceAtThreshold: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
