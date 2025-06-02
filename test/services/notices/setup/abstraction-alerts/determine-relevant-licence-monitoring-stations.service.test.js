'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const DetermineRelevantLicenceMonitoringStationsService = require('../../../../../app/services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations.service.js')

describe('Notices Setup - Abstraction Alerts - Determine relevant licence monitoring stations service', () => {
  let alertType
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let licenceMonitoringStations
  let removedLicenceMonitoringStations
  let selectedLicenceMonitoringStations

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStations = abstractionAlertSessionData.licenceMonitoringStations

    licenceMonitoringStationOne = licenceMonitoringStations[0]
    licenceMonitoringStationTwo = licenceMonitoringStations[1]
    licenceMonitoringStationThree = licenceMonitoringStations[2]

    selectedLicenceMonitoringStations = [
      licenceMonitoringStationOne.thresholdGroup,
      licenceMonitoringStationTwo.thresholdGroup,
      licenceMonitoringStationThree.thresholdGroup
    ]

    alertType = 'warning'

    removedLicenceMonitoringStations = []
  })

  it('returns the licence monitoring stations', () => {
    const result = DetermineRelevantLicenceMonitoringStationsService.go(
      licenceMonitoringStations,
      selectedLicenceMonitoringStations,
      removedLicenceMonitoringStations,
      alertType
    )

    expect(result).to.equal([licenceMonitoringStationOne, licenceMonitoringStationTwo, licenceMonitoringStationThree])
  })

  describe('when there are "selectedLicenceMonitoringStations"', () => {
    beforeEach(() => {
      selectedLicenceMonitoringStations = [licenceMonitoringStationOne.thresholdGroup]
    })
    it('returns only the lLicence monitoring stations previously selected', () => {
      const result = DetermineRelevantLicenceMonitoringStationsService.go(
        licenceMonitoringStations,
        selectedLicenceMonitoringStations,
        removedLicenceMonitoringStations,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStationOne])
    })
  })

  describe('when there are "removedLicenceMonitoringStations"', () => {
    beforeEach(() => {
      removedLicenceMonitoringStations = [licenceMonitoringStationOne.id]
    })

    it('returns only the licence monitoring stations previously selected and not removed', () => {
      const result = DetermineRelevantLicenceMonitoringStationsService.go(
        licenceMonitoringStations,
        selectedLicenceMonitoringStations,
        removedLicenceMonitoringStations,
        alertType
      )

      expect(result.length).to.equal(2)

      expect(result).to.equal([licenceMonitoringStationTwo, licenceMonitoringStationThree])
    })
  })

  describe('when the "alertType" is "stop"', () => {
    beforeEach(() => {
      alertType = 'stop'

      selectedLicenceMonitoringStations = [licenceMonitoringStationTwo.thresholdGroup]
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsService.go(
        licenceMonitoringStations,
        selectedLicenceMonitoringStations,
        removedLicenceMonitoringStations,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStationTwo])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations[2].restrictionType = 'stop_or_reduce'

        selectedLicenceMonitoringStations = [
          licenceMonitoringStationTwo.thresholdGroup,
          licenceMonitoringStationThree.thresholdGroup
        ]
      })

      it('returns the licence monitoring stations, without the "stop_or_reduce" licence monitoring station', () => {
        const result = DetermineRelevantLicenceMonitoringStationsService.go(
          licenceMonitoringStations,
          selectedLicenceMonitoringStations,
          removedLicenceMonitoringStations,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStationTwo])
      })
    })
  })

  describe('when the "alertType" is "reduce"', () => {
    beforeEach(() => {
      alertType = 'reduce'

      selectedLicenceMonitoringStations = [licenceMonitoringStationOne.thresholdGroup]
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsService.go(
        licenceMonitoringStations,
        selectedLicenceMonitoringStations,
        removedLicenceMonitoringStations,
        alertType
      )

      expect(result).to.equal([licenceMonitoringStationOne])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations[1].restrictionType = 'stop_or_reduce'

        selectedLicenceMonitoringStations = [
          licenceMonitoringStationOne.thresholdGroup,
          licenceMonitoringStationTwo.thresholdGroup
        ]
      })

      it('returns the licence monitoring stations, with "stop_or_reduce" but without the stop type)', () => {
        const result = DetermineRelevantLicenceMonitoringStationsService.go(
          licenceMonitoringStations,
          selectedLicenceMonitoringStations,
          removedLicenceMonitoringStations,
          alertType
        )

        expect(result).to.equal([licenceMonitoringStationOne, licenceMonitoringStationTwo])
      })
    })
  })
})
