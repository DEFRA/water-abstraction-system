'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CheckLicenceMatchesPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Presenter', () => {
  let abstractionAlertSessionData
  let session

  beforeEach(() => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()
    session = {
      ...abstractionAlertSessionData,
      alertThresholds: [abstractionAlertSessionData.licenceMonitoringStations[0].id]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result).to.equal({})
    })

    it.only('returns the selected licence monitoring stations from the "alertThresholds"', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result.licences).to.equal([abstractionAlertSessionData.licenceMonitoringStations[0]])
    })
  })
})
