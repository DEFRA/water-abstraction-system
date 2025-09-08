'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckLicenceMatchesService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js')

describe('Notices Setup - Abstraction Alerts - Submit Check Licence Matches Service', () => {
  let licenceMonitoringStationDuplicate
  let licenceMonitoringStations
  let session
  let sessionData

  beforeEach(async () => {
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
  })

  describe('when called', () => {
    describe('and there are no licence monitoring stations removed', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the "licenceRefs" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([
          licenceMonitoringStations.one.licence.licenceRef,
          licenceMonitoringStations.two.licence.licenceRef,
          licenceMonitoringStations.three.licence.licenceRef
        ])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(async () => {
        sessionData.licenceMonitoringStations = [licenceMonitoringStations.one, licenceMonitoringStationDuplicate]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the "licenceRefs" to the session with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([licenceMonitoringStations.one.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStations.one,
          licenceMonitoringStationDuplicate
        ])
      })
    })

    describe('and there are no licence monitoring stations removed', () => {
      beforeEach(async () => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id, licenceMonitoringStations.two.id]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the "licenceRefs" to the session without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([licenceMonitoringStations.three.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([licenceMonitoringStations.three])
      })
    })
  })
})
