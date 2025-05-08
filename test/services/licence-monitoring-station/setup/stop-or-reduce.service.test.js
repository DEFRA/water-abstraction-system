'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const StopOrReduceService = require('../../../../app/services/licence-monitoring-station/setup/stop-or-reduce.service.js')

describe('Licence Monitoring Station Setup - Stop Or Reduce service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869',
        label: 'Monitoring Station Label'
      }
    })
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
          activeNavBar: 'search',
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
