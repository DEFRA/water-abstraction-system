'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const DetermineRelevantLicenceMonitoringStationsByAlertTypeService = require('../../../../../app/services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js')

describe('Notices Setup - Abstraction Alerts - Determine relevant licence monitoring stations by alert type service', () => {
  let alertType
  let licenceMonitoringStations
  let licenceMonitoringStationsData

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]

    alertType = 'warning'
  })

  it('returns the licence monitoring stations', () => {
    const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
      licenceMonitoringStationsData,
      alertType
    )

    expect(result).to.equal([
      licenceMonitoringStations.one,
      licenceMonitoringStations.two,
      licenceMonitoringStations.three
    ])
  })

  describe('when the "alertType" is "stop"', () => {
    beforeEach(() => {
      alertType = 'stop'

      licenceMonitoringStations.one.restrictionType = 'reduce'
      licenceMonitoringStations.two.restrictionType = 'stop'
      licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'

      licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
        licenceMonitoringStationsData,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStations.two])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, without the "stop_or_reduce" licence monitoring station', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
          licenceMonitoringStationsData,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStations.two])
      })
    })
  })

  describe('when the "alertType" is "reduce"', () => {
    beforeEach(() => {
      alertType = 'reduce'
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
        licenceMonitoringStationsData,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStations.one])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.two.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, with "stop_or_reduce" but without the stop type)', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
          licenceMonitoringStationsData,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStations.one, licenceMonitoringStations.two])
      })
    })
  })
})
