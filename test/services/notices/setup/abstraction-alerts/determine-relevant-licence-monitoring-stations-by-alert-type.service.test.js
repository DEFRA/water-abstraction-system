// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import DetermineRelevantLicenceMonitoringStationsByAlertTypeService from '../../../../../src/services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js'

describe('Notices Setup - Abstraction Alerts - Determine Relevant Licence Monitoring Stations By Alert Type service', () => {
  let alertType
  let licenceMonitoringStations
  let licenceMonitoringStationsData
  let removedLicenceMonitoringStations

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]

    alertType = 'warning'
    removedLicenceMonitoringStations = undefined
  })

  it('returns the licence monitoring stations', () => {
    const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
      alertType,
      licenceMonitoringStationsData,
      removedLicenceMonitoringStations
    )

    expect(result).toEqual([
      licenceMonitoringStations.one,
      licenceMonitoringStations.two,
      licenceMonitoringStations.three
    ])
  })

  describe('when the "alertType" is "stop"', () => {
    beforeEach(() => {
      alertType = 'stop'

      licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
        alertType,
        licenceMonitoringStationsData,
        removedLicenceMonitoringStations
      )

      expect(result).toEqual([licenceMonitoringStations.two])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, without the "stop_or_reduce" licence monitoring station', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
          alertType,
          licenceMonitoringStationsData,
          removedLicenceMonitoringStations
        )

        expect(result).toEqual([licenceMonitoringStations.two])
      })
    })
  })

  describe('when the "alertType" is "reduce"', () => {
    beforeEach(() => {
      alertType = 'reduce'
    })

    it('returns the licence monitoring stations (with the reduce type removed)', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
        alertType,
        licenceMonitoringStationsData,
        removedLicenceMonitoringStations
      )

      expect(result).toEqual([licenceMonitoringStations.one, licenceMonitoringStations.three])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.two.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, with "stop_or_reduce" but without the stop type)', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
          alertType,
          licenceMonitoringStationsData,
          removedLicenceMonitoringStations
        )

        expect(result).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })
    })
  })

  describe('when licence monitoring stations have been removed', () => {
    beforeEach(() => {
      removedLicenceMonitoringStations = [licenceMonitoringStations.one.id]
    })

    it('returns the licence monitoring stations without those removed', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
        alertType,
        licenceMonitoringStationsData,
        removedLicenceMonitoringStations
      )

      expect(result).toEqual([licenceMonitoringStations.two, licenceMonitoringStations.three])
    })

    describe('and the "alertType" also excludes a licence monitoring station', () => {
      beforeEach(() => {
        alertType = 'reduce'
      })

      it('returns only the licence monitoring stations left after both are applied', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
          alertType,
          licenceMonitoringStationsData,
          removedLicenceMonitoringStations
        )

        expect(result).toEqual([licenceMonitoringStations.three])
      })
    })
  })

  describe('when no licence monitoring stations have been removed', () => {
    beforeEach(() => {
      removedLicenceMonitoringStations = []
    })

    it('returns all the licence monitoring stations', () => {
      const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
        alertType,
        licenceMonitoringStationsData,
        removedLicenceMonitoringStations
      )

      expect(result).toEqual([
        licenceMonitoringStations.one,
        licenceMonitoringStations.two,
        licenceMonitoringStations.three
      ])
    })
  })
})
