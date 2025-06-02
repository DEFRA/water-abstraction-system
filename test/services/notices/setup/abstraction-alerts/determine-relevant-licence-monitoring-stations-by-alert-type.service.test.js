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
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let licenceMonitoringStations

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStations = abstractionAlertSessionData.licenceMonitoringStations

    licenceMonitoringStationOne = licenceMonitoringStations[0]
    licenceMonitoringStationTwo = licenceMonitoringStations[1]
    licenceMonitoringStationThree = licenceMonitoringStations[2]

    alertType = 'warning'
  })

  it('returns the licence monitoring stations', () => {
    const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(licenceMonitoringStations, alertType)

    expect(result).to.equal([licenceMonitoringStationOne, licenceMonitoringStationTwo, licenceMonitoringStationThree])
  })

  describe('when the "alertType" is "stop"', () => {
    beforeEach(() => {
      alertType = 'stop'

      licenceMonitoringStations[1].restrictionType = 'stop'
      licenceMonitoringStations[0].restrictionType = 'reduce'
      licenceMonitoringStations[2].restrictionType = 'stop_or_reduce'
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
        licenceMonitoringStations,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStationTwo])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations[2].restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, without the "stop_or_reduce" licence monitoring station', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
          licenceMonitoringStations,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStationTwo])
      })
    })
  })

  describe('when the "alertType" is "reduce"', () => {
    beforeEach(() => {
      alertType = 'reduce'
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
        licenceMonitoringStations,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStationOne])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations[1].restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, with "stop_or_reduce" but without the stop type)', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
          licenceMonitoringStations,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStationOne, licenceMonitoringStationTwo])
      })
    })
  })
})
