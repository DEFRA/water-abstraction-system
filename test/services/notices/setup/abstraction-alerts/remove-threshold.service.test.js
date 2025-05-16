'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const RemoveThresholdService = require('../../../../../app/services/notices/setup/abstraction-alerts/remove-threshold.service.js')

describe('Remove Threshold Service', () => {
  let abstractionAlertSessionData
  let licenceMonitoringStationId
  let licenceMonitoringStationOne
  let session
  let yarStub

  beforeEach(() => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStationOne = abstractionAlertSessionData.licenceMonitoringStations[0]

    licenceMonitoringStationId = licenceMonitoringStationOne.id

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: abstractionAlertSessionData
        })
      })

      it('saves the "licenceMonitoringStationId" to the session to be excluded from the list', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStationId, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([licenceMonitoringStationId])
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            ...abstractionAlertSessionData,
            removedThresholds: [licenceMonitoringStationId]
          }
        })
      })

      it('saves the "licenceMonitoringStationId" to the session with the existing "removedThresholds"', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStationId, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([licenceMonitoringStationId, licenceMonitoringStationId])
      })
    })

    describe('and there is a notification', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            ...abstractionAlertSessionData,
            removedThresholds: [licenceMonitoringStationId]
          }
        })
      })
      it('sets a flash message', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStationId, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: `Removed ${licenceMonitoringStationOne.licence.licenceRef} Reduce 1000m`,
          title: 'Updated'
        })
      })
    })
  })
})
