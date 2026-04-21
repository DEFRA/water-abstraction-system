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
const CheckService = require('../../../../app/services/licence-monitoring-station/setup/check.service.js')

describe('Licence Monitoring Station Setup - Check Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      unit: 'Ml/d',
      label: 'LABEL',
      threshold: 100,
      licenceRef: 'LICENCE_REF',
      conditionId: 'no_condition',
      stopOrReduce: 'stop',
      reduceAtThreshold: null,
      conditionDisplayText: 'None',
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await CheckService.go(session.id)

      expect(result).to.equal({
        abstractionPeriod: '1 February to 3 April',
        abstractionPeriodManuallyEntered: true,
        condition: 'None',
        licenceRef: 'LICENCE_REF',
        links: {
          threshold: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
          type: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
          licenceNumber: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
          licenceCondition: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          abstractionPeriod: `/system/licence-monitoring-station/setup/${session.id}/abstraction-period`
        },
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Check the restriction details',
        threshold: '100Ml/d',
        type: 'Stop'
      })
    })

    it('sets the "checkPageVisited" flag to "true"', async () => {
      await CheckService.go(session.id)

      expect(session.checkPageVisited).to.be.true()
      expect(session.$update.called).to.be.true()
    })
  })
})
