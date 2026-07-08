// Test helpers
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as LicenceMonitoringStationHelper from '../../support/helpers/licence-monitoring-station.helper.js'
import * as LicenceVersionPurposeConditionHelper from '../../support/helpers/licence-version-purpose-condition.helper.js'
import * as LicenceVersionPurposeConditionTypeHelper from '../../support/helpers/licence-version-purpose-condition-type.helper.js'
import * as MonitoringStationHelper from '../../support/helpers/monitoring-station.helper.js'

// Thing under test
import FetchLicenceMonitoringStationService from '../../../app/services/licence-monitoring-station/fetch-licence-monitoring-station.service.js'

describe('Licence Monitoring Station - Fetch Licence Monitoring Station service', () => {
  let licence
  let monitoringStation

  beforeAll(async () => {
    licence = await LicenceHelper.add()
    monitoringStation = await MonitoringStationHelper.add({
      catchmentName: 'The Catchment',
      label: 'The Monitoring Station',
      riverName: 'The River'
    })
  })

  describe('when a matching licence monitoring station exists that is linked to a condition', () => {
    let licenceMonitoringStation
    let licenceVersionPurposeCondition

    beforeEach(async () => {
      const { id: licenceVersionPurposeConditionTypeId } = LicenceVersionPurposeConditionTypeHelper.select(22)

      licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeConditionTypeId
      })

      licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
        createdAt: new Date('2025-05-20'),
        licenceId: licence.id,
        licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
        monitoringStationId: monitoringStation.id,
        restrictionType: 'reduce'
      })
    })

    it('returns the matching data', async () => {
      const result = await FetchLicenceMonitoringStationService(licenceMonitoringStation.id)

      expect(result).toEqual({
        id: licenceMonitoringStation.id,
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        monitoringStation: {
          id: monitoringStation.id,
          catchmentName: 'The Catchment',
          label: 'The Monitoring Station',
          riverName: 'The River'
        },
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        licenceVersionPurposeCondition: {
          externalId: licenceVersionPurposeCondition.externalId,
          licenceVersionPurposeConditionType: {
            displayTitle: 'Flow cessation condition'
          }
        }
      })
    })
  })

  describe('when a matching licence monitoring station exists that is NOT linked to a condition', () => {
    let licenceMonitoringStation

    beforeEach(async () => {
      licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
        createdAt: new Date('2025-05-20'),
        licenceId: licence.id,
        monitoringStationId: monitoringStation.id,
        restrictionType: 'reduce'
      })
    })

    it('returns the matching data', async () => {
      const result = await FetchLicenceMonitoringStationService(licenceMonitoringStation.id)

      expect(result).toEqual({
        id: licenceMonitoringStation.id,
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        monitoringStation: {
          id: monitoringStation.id,
          catchmentName: 'The Catchment',
          label: 'The Monitoring Station',
          riverName: 'The River'
        },
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        licenceVersionPurposeCondition: null
      })
    })
  })
})
