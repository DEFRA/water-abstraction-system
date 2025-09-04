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

describe('Notices Setup - Abstraction Alerts - Remove Threshold Service', () => {
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: sessionData
        })
      })

      it('saves the "licenceMonitoringStationId" to the session to be excluded from the list', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([licenceMonitoringStations.one.id])
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            ...sessionData,
            removedThresholds: [licenceMonitoringStations.one.id]
          }
        })
      })

      it('saves the "licenceMonitoringStationId" to the session with the existing "removedThresholds"', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removedThresholds).to.equal([
          licenceMonitoringStations.one.id,
          licenceMonitoringStations.one.id
        ])
      })
    })

    describe('and there is a notification', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            ...sessionData,
            removedThresholds: [licenceMonitoringStations.one.id]
          }
        })
      })
      it('sets a flash message', async () => {
        await RemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: `Removed ${licenceMonitoringStations.one.licence.licenceRef} Reduce 1000m`,
          title: 'Updated',
          titleText: 'Updated'
        })
      })
    })
  })
})
