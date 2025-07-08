'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationModel = require('../../../../app/models/licence-monitoring-station.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/licence-monitoring-station/setup/submit-check.service.js')

describe('Licence Monitoring Station Setup - Submit Check Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      unit: 'Ml/d',
      label: 'FRENCHAY',
      licenceId: 'ebefaaca-e837-442f-8a23-79e247d56a94',
      threshold: 100,
      licenceRef: '6/33/03/*S/0010',
      conditionId: '789e3bbe-1505-4e61-9f60-51f089004f7d',
      stopOrReduce: 'stop',
      checkPageVisited: true,
      reduceAtThreshold: null,
      monitoringStationId: 'bb560226-ca09-4b6b-8a16-b6e285514a65',
      conditionDisplayText: 'CONDITION_DISPLAY_TEXT',
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('creates the monitoring station tag', async () => {
      await SubmitCheckService.go(session.id, payload)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.monitoringStationId).to.exist()
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.not.exist()
    })

    it('continues the journey', async () => {
      const result = await SubmitCheckService.go(session.id, payload)

      expect(result).to.equal(sessionData.monitoringStationId)
    })
  })
})
