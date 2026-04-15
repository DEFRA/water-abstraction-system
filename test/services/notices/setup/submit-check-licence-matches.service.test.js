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
const SubmitCheckLicenceMatchesService = require('../../../../app/services/notices/setup/submit-check-licence-matches.service.js')

describe('Notices - Setup - Submit Check Licence Matches service', () => {
  let fetchSessionStub
  let licenceMonitoringStationDuplicate
  let licenceMonitoringStations
  let session
  let sessionData

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    // A licence monitoring station can have the same licence as another. When this is the case we need to check we
    // handle duplicate licence refs and that we do no strip / remove them unexpectedly
    licenceMonitoringStationDuplicate = licenceMonitoringStations.one

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ]
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there are no licence monitoring stations removed', () => {
      it('saves the "licenceRefs" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.licenceRefs).to.equal([
          licenceMonitoringStations.one.licence.licenceRef,
          licenceMonitoringStations.two.licence.licenceRef,
          licenceMonitoringStations.three.licence.licenceRef
        ])

        expect(session.$update.called).to.be.true()
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(() => {
        sessionData.licenceMonitoringStations = [licenceMonitoringStations.one, licenceMonitoringStationDuplicate]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the "licenceRefs" to the session with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.licenceRefs).to.equal([licenceMonitoringStations.one.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStations.one,
          licenceMonitoringStationDuplicate
        ])
      })
    })

    describe('and there are no licence monitoring stations removed', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id, licenceMonitoringStations.two.id]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the "licenceRefs" to the session without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.licenceRefs).to.equal([licenceMonitoringStations.three.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        expect(session.relevantLicenceMonitoringStations).to.equal([licenceMonitoringStations.three])
      })
    })
  })
})
