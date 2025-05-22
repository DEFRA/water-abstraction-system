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
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let session
  let sessionData

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStationOne = abstractionAlertSessionData.licenceMonitoringStations[0]
    licenceMonitoringStationTwo = abstractionAlertSessionData.licenceMonitoringStations[1]
    licenceMonitoringStationThree = abstractionAlertSessionData.licenceMonitoringStations[2]

    // A licence monitoring station can have the same licence as another. When this is the case we need to check we
    // handle duplicate licence refs and that we do no strip / remove them unexpectedly
    licenceMonitoringStationDuplicate = licenceMonitoringStationOne

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStationOne.thresholdGroup,
        licenceMonitoringStationTwo.thresholdGroup,
        licenceMonitoringStationThree.thresholdGroup
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
          licenceMonitoringStationOne.licence.licenceRef,
          licenceMonitoringStationTwo.licence.licenceRef,
          licenceMonitoringStationThree.licence.licenceRef
        ])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStationOne,
          licenceMonitoringStationTwo,
          licenceMonitoringStationThree
        ])
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(async () => {
        sessionData.licenceMonitoringStations = [licenceMonitoringStationOne, licenceMonitoringStationDuplicate]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the "licenceRefs" to the session with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([licenceMonitoringStationOne.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([
          licenceMonitoringStationOne,
          licenceMonitoringStationDuplicate
        ])
      })
    })

    describe('and there are no licence monitoring stations removed', () => {
      beforeEach(async () => {
        sessionData.removedThresholds = [licenceMonitoringStationOne.id, licenceMonitoringStationTwo.id]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the "licenceRefs" to the session without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([licenceMonitoringStationThree.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.relevantLicenceMonitoringStations).to.equal([licenceMonitoringStationThree])
      })
    })
  })
})
