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
const CheckLicenceMatchesService = require('../../../../../app/services/notices/setup/abstraction-alerts/check-licence-matches.service.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Service', () => {
  let abstractionAlertSessionData
  let licenceWithThreshold
  let session
  let sessionData

  beforeEach(async () => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceWithThreshold = abstractionAlertSessionData.licenceMonitoringStations[0]

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [licenceWithThreshold.id]
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckLicenceMatchesService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        licences: [
          {
            licenceRef: licenceWithThreshold.licence_ref,
            thresholds: [
              {
                abstractionPeriod: '1 February to 1 January',
                flow: 'reduce',
                threshold: '1000 m'
              }
            ]
          }
        ]
      })
    })
  })
})
