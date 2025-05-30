'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const AlertTypeValidator = require('../../../../../app/validators/notices/setup/abstraction-alerts/alert-type.validator.js')

describe('Notices - Setup - Abstraction Alerts - Alert Type Validator', () => {
  let payload
  let licenceMonitoringStations
  let licenceMonitoringStationsData

  beforeEach(() => {
    payload = {
      'alert-type': 'stop'
    }

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertTypeValidator.go(payload, licenceMonitoringStationsData)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })

    describe('when the a restriction type is "stop_or_reduce" and there are no other licence monitoring stations', () => {
      beforeEach(() => {
        licenceMonitoringStationsData = [{ ...licenceMonitoringStations.one, restrictionType: 'stop_or_reduce' }]
      })

      it('returns with no errors', () => {
        const result = AlertTypeValidator.go(payload, licenceMonitoringStationsData)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('and the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = AlertTypeValidator.go(payload, licenceMonitoringStationsData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the type of alert you need to send')
      })
    })

    describe('and the "alert-type" is not available', () => {
      beforeEach(() => {
        licenceMonitoringStationsData = [
          {
            ...licenceMonitoringStations.one,
            restrictionType: 'warning'
          }
        ]
      })

      it('returns with errors', () => {
        const result = AlertTypeValidator.go(payload, licenceMonitoringStationsData)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
        )
      })
    })
  })
})
