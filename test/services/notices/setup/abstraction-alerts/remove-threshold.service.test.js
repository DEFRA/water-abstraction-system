'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const RemoveThresholdService = require('../../../../../app/services/notices/setup/abstraction-alerts/remove-threshold.service.js')

describe('Remove Threshold Service', () => {
  let session
  let licenceMonitoringStationId

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      beforeEach(async () => {
        licenceMonitoringStationId = generateUUID()

        session = await SessionHelper.add()
      })

      it('saves the "licenceMonitoringStationId" to the session to be excluded from the list', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStationId)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([licenceMonitoringStationId])
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(async () => {
        licenceMonitoringStationId = generateUUID()

        session = await SessionHelper.add({
          data: {
            removedThresholds: [licenceMonitoringStationId]
          }
        })
      })

      it('saves the "licenceMonitoringStationId" to the session with the existing "removedThresholds"', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStationId)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([licenceMonitoringStationId, licenceMonitoringStationId])
      })
    })
  })
})
