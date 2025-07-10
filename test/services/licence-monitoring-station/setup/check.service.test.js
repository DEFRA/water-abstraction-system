'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/licence-monitoring-station/setup/check.service.js')

describe('Licence Monitoring Station Setup - Check Service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        unit: 'Ml/d',
        label: 'LABEL',
        threshold: 100,
        licenceRef: 'LICENCE_REF',
        conditionId: 'not_listed',
        stopOrReduce: 'stop',
        reduceAtThreshold: null,
        conditionDisplayText: 'None',
        abstractionPeriodEndDay: '3',
        abstractionPeriodEndMonth: '4',
        abstractionPeriodStartDay: '1',
        abstractionPeriodStartMonth: '2'
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await CheckService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
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

      const refreshedSession = await session.$query()

      expect(refreshedSession.checkPageVisited).to.be.true()
    })
  })
})
