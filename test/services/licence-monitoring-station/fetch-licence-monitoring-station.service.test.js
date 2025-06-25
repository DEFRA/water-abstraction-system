'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')

// Thing under test
const FetchLicenceMonitoringStationService = require('../../../app/services/licence-monitoring-station/fetch-licence-monitoring-station.service.js')

describe('Licence Monitoring Station - Fetch Licence Monitoring Station service', () => {
  let licence
  let monitoringStation

  before(async () => {
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
      const result = await FetchLicenceMonitoringStationService.go(licenceMonitoringStation.id)

      expect(result).to.equal({
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
      const result = await FetchLicenceMonitoringStationService.go(licenceMonitoringStation.id)

      expect(result).to.equal({
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
