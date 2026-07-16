// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import DetermineRelevantLicenceMonitoringStationsByAlertTypeService from '../../../../../app/services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js'

describe('Notices Setup - Abstraction Alerts - Determine Relevant Licence Monitoring Stations By Alert Type service', () => {
  let alertType
  let licenceMonitoringStations
  let licenceMonitoringStationsData

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]

    alertType = 'warning'
  })

  it('returns the licence monitoring stations', () => {
    const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
      licenceMonitoringStationsData,
      alertType
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
        licenceMonitoringStationsData,
        alertType
      )

      expect(result).toEqual([licenceMonitoringStations.two])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.three.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, without the "stop_or_reduce" licence monitoring station', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
          licenceMonitoringStationsData,
          alertType
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
        licenceMonitoringStationsData,
        alertType
      )

      expect(result).toEqual([licenceMonitoringStations.one, licenceMonitoringStations.three])
    })

    describe('and a licence monitoring station has the "restrictionType" "stop_or_reduce"', () => {
      beforeEach(() => {
        licenceMonitoringStations.two.restrictionType = 'stop_or_reduce'
      })

      it('returns the licence monitoring stations, with "stop_or_reduce" but without the stop type)', () => {
        const result = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
          licenceMonitoringStationsData,
          alertType
        )

        expect(result).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })
    })
  })
})
