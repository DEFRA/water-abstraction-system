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
  let alertThresholdGroupOne
  let alertThresholdGroupThree
  let alertThresholdGroupTwo
  let session
  let sessionData

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    alertThresholdGroupOne = abstractionAlertSessionData.licenceMonitoringStations[0]
    alertThresholdGroupTwo = abstractionAlertSessionData.licenceMonitoringStations[1]
    alertThresholdGroupThree = abstractionAlertSessionData.licenceMonitoringStations[2]

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        alertThresholdGroupOne.thresholdGroup,
        alertThresholdGroupTwo.thresholdGroup,
        alertThresholdGroupThree.thresholdGroup
      ]
    }
  })

  describe('when called', () => {
    describe('and there are no thresholds removed', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([
          alertThresholdGroupOne.licence.licenceRef,
          alertThresholdGroupTwo.licence.licenceRef,
          alertThresholdGroupThree.licence.licenceRef
        ])
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(async () => {
        sessionData.licenceMonitoringStations = [alertThresholdGroupOne, alertThresholdGroupOne]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([alertThresholdGroupOne.licence.licenceRef])
      })
    })

    describe('and there are thresholds removed', () => {
      beforeEach(async () => {
        sessionData.removedThresholds = [alertThresholdGroupOne.id, alertThresholdGroupTwo.id]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value, without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService.go(session.id)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRefs).to.equal([alertThresholdGroupThree.licence.licenceRef])
      })
    })
  })
})
