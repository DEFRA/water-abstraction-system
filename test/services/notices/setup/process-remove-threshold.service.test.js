'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ProcessRemoveThresholdService = require('../../../../app/services/notices/setup/process-remove-threshold.service.js')

describe('Notices - Setup - Process Remove Threshold service', () => {
  let fetchSessionStub
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      it('saves the "licenceMonitoringStationId" to the session to be excluded from the list', async () => {
        await ProcessRemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        expect(session.removedThresholds).to.equal([licenceMonitoringStations.one.id])
        expect(session.$update.called).to.be.true()
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the "licenceMonitoringStationId" to the session with the existing "removedThresholds"', async () => {
        await ProcessRemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        expect(session.removedThresholds).to.equal([licenceMonitoringStations.one.id, licenceMonitoringStations.one.id])
      })
    })

    describe('and there is a notification', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })
      it('sets a flash message', async () => {
        await ProcessRemoveThresholdService.go(session.id, licenceMonitoringStations.one.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: `Removed ${licenceMonitoringStations.one.licence.licenceRef} Reduce 1000m`,
          titleText: 'Updated'
        })
      })
    })
  })
})
